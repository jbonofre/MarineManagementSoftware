import { Row, Col, Card, Calendar } from 'antd';

export default function Home() {

    return(
        <Row gutter={10}>
            <Col span={10}>
                <Card title="Messages" style={{ height: 800 }}>
                    <p><b>Accueil (23-06-2025)</b> Rappeler John Doeuf</p>
                    <p><b>Chantier (22-06-2025)</b> Rappel Mercury, mise à jour de l'échéancier d'entretien</p>
                </Card>
            </Col>
            <Col span={14}>
                <Card title="Planning" style={{ height: 800 }}>
                    <Calendar />
                </Card>
            </Col>
        </Row>
    );

}