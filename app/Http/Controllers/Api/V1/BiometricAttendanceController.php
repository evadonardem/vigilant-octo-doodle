<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\ZKLib\ZKLibrary;
use Dingo\Api\Routing\Helpers;
use App\Models\AttendanceLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class BiometricAttendanceController extends Controller
{
    use Helpers;

    private $zk = null;
    
    public function __construct(
		User $currentUser,
		bool $isSuperAdmin = false
    )
    {
		$user = request()->user();
		$this->currentUser = $user;
		$this->isSuperAdmin = $user->hasRole('Super Admin');
	}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $users = $this->api->get('biometric/users');
        $users = $users['data'];

        if (env('DEVICE_ENABLED')) {
            $this->zk = new ZKLibrary(env('DEVICE_IP'), env('DEVICE_PORT'));
            $this->zk->connect();

            $logs = $this->zk->getAttendance();
            foreach ($logs as $log) {
                $biometricId = $log['biometric_id'];
                $filteredUser = array_filter($users, function ($user) use ($biometricId) {
                    return $user['biometric_id'] == $biometricId;
                });
                $user = array_pop($filteredUser);

                if ($user) {
                    AttendanceLog::where([
                    'biometric_id' => $log['biometric_id'],
                    'biometric_timestamp' => $log['timestamp']
                  ])->delete();

                    AttendanceLog::create([
                    'biometric_id' => $log['biometric_id'],
                    'biometric_name' => $user['name'],
                    'biometric_timestamp' => $log['timestamp']
                  ]);
                }
            }

            $this->zk->clearAttendance();
            $this->zk->disconnect();
        }

        // filtering parameters
        $biometricIds = $request->input('biometric_id')
          ? explode(',', $request->input('biometric_id'))
          : null;
        $name = $request->input('name');
        $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'))
          ->setTime(0, 0, 0)
          ->format('Y-m-d H:i:s');
        $endDate = Carbon::createFromFormat('Y-m-d', $request->input('end_date'))
          ->setTime(23, 59, 59)
          ->format('Y-m-d H:i:s');

        $logsQry = AttendanceLog::whereBetween('biometric_timestamp', [$startDate, $endDate]);
        
        if ($this->isSuperAdmin) {
			Log::debug('Filtering attendance logs as super admin.');
			if ($biometricIds) {
				$biometricIdsChunks = array_chunk($biometricIds, 10);
				$logsQry->where(function ($query) use ($biometricIdsChunks) {
					foreach ($biometricIdsChunks as $chunk) {
						$query->orWhereIn('biometric_id', $chunk);
					}
				});
			}

			if ($name) {
				$logsQry->where('biometric_name', 'like', '%' . $name . '%');
			}	
		} else {
			Log::debug('Filtering attendance logs as standard user.');
			$logsQry->where('biometric_id', $this->currentUser->biometric_id); 
		}

        $logs = $logsQry->orderBy('biometric_timestamp', 'asc')->get();

        return response()->json(['data' => $logs]);
    }
}
