import { Row, Col, Card, Calendar } from 'antd';

export default function Home() {

    return(
        <Row gutter={10}>
            <Col span={10}>
                <Card title="Messages" extra={<a href="#">Voir</a>} style={{ height: 600 }}>
                    <p>Message</p>
                    <p>Notification</p>
                    <p>Message</p>
                </Card>
            </Col>
            <Col span={14}>
                <Card title="Planning" extra={<a href="#">Voir</a>} style={{ height: 600 }}>
                    <Calendar />
                </Card>
            </Col>
        </Row>
    );

}