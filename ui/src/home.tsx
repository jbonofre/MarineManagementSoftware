import { Space, Card } from 'antd';

export default function Home() {

    return(
        <Space>
            <Card title="Messages" extra={<a href="#">Voir</a>} style={{ width: 400, height: 600 }}>
                <p>Message</p>
                <p>Notification</p>
                <p>Message</p>
            </Card>
            <Card title="Planning" extra={<a href="#">Voir</a>} style={{ width: 400, height: 600 }}>
                <p>Evenement</p>
                <p>Evenement</p>
                <p>Evenement</p>
            </Card>
        </Space>
    );

}