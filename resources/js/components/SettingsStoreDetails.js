import React, { Component } from 'react';
import cookie from 'react-cookies';
import { Badge, Breadcrumb, Card } from 'react-bootstrap';

export default class SettingStoreDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storeId: null,
            storeCode: null,
            storeName: null,
            storeAddress: null,
        };
    }

    componentDidMount() {
        const token = cookie.load('token');
        const self = this;
        const { params } = self.props.match;
        const { storeId } = params;

        axios.get(`${apiBaseUrl}/settings/stores/${storeId}?token=${token}`)
            .then((response) => {
                const { data: store } = response.data;
                self.setState({
                    storeId: store.id,
                    storeCode: store.code,
                    storeName: store.name,
                    storeAddress: store.address_line,
                });
            })
            .catch(() => {
                location.href = `${appBaseUrl}`;
            });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    render() {
        const {
            storeId,
            storeCode,
            storeName,
            storeAddress,
        } = this.state;

        return (
            <div className="container-fluid my-4">
                <Breadcrumb>
                    <Breadcrumb.Item href="#/settings"><i className="fa fa-cogs"></i> Settings</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/settings-stores">Stores Registry</Breadcrumb.Item>
                    <Breadcrumb.Item active>{storeCode}</Breadcrumb.Item>
                </Breadcrumb>
                <div className="row">
                    <div className="col-md-3">
                        <Card bg="dark" text="white">
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{storeCode}</Badge></p>
                                    <p>{storeName}</p>
                                </Card.Title>
                                <Card.Subtitle>{storeAddress}</Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-6">
                        <Card bg="dark" text="white">
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{storeCode}</Badge></p>
                                    <p>{storeName}</p>
                                </Card.Title>
                                <Card.Subtitle>{storeAddress}</Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="col-md-3">
                        <Card bg="dark" text="white">
                            <Card.Body>
                                <Card.Title>
                                    <p><Badge variant="primary">{storeCode}</Badge></p>
                                    <p>{storeName}</p>
                                </Card.Title>
                                <Card.Subtitle>{storeAddress}</Card.Subtitle>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
