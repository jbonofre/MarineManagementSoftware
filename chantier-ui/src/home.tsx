import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography, Row, Col, Card, Input, Button, Space, Divider, Tag, Modal } from 'antd';
import { SmileOutlined, RobotOutlined, SendOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type JsonRpcResponse = {
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
};

type ParsedInstruction = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    query?: any;
    body?: any;
    translatedCommand: string;
};

type AiProvider = 'anthropic';
type AiMcpDirective = {
    action: 'reply' | 'mcp_call';
    message?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path?: string;
    query?: any;
    body?: any;
};

const extractJsonCandidate = (raw: string) => {
    const trimmed = (raw || '').trim();
    if (!trimmed) {
        return '';
    }
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        return fenced[1].trim();
    }
    return trimmed;
};

const tryParseJsonForDisplay = (content: string) => {
    const candidate = extractJsonCandidate(content);
    if (!candidate.startsWith('{') && !candidate.startsWith('[')) {
        return null;
    }
    try {
        return JSON.parse(candidate);
    } catch (_err) {
        return null;
    }
};

const renderJsonNode = (value: any, depth = 0): React.ReactNode => {
    const nestedContainerStyle: React.CSSProperties = {
        marginLeft: depth > 0 ? 14 : 0,
        borderLeft: depth > 0 ? '2px solid #f0f0f0' : 'none',
        paddingLeft: depth > 0 ? 10 : 0
    };

    if (value === null) {
        return <span style={{ color: '#8c8c8c' }}>null</span>;
    }

    if (typeof value === 'string') {
        return <span style={{ color: '#1677ff' }}>"{value}"</span>;
    }

    if (typeof value === 'number') {
        return <span style={{ color: '#722ed1' }}>{value}</span>;
    }

    if (typeof value === 'boolean') {
        return <span style={{ color: '#d46b08' }}>{String(value)}</span>;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span>[]</span>;
        }
        return (
            <div style={nestedContainerStyle}>
                {value.map((item, index) => (
                    <div key={index} style={{ marginTop: 4 }}>
                        <span style={{ color: '#595959', marginRight: 6 }}>[{index}]</span>
                        {renderJsonNode(item, depth + 1)}
                    </div>
                ))}
            </div>
        );
    }

    const entries = Object.entries(value || {});
    if (entries.length === 0) {
        return <span>{'{}'}</span>;
    }

    return (
        <div style={nestedContainerStyle}>
            {entries.map(([ key, nestedValue ]) => (
                <div key={key} style={{ marginTop: 4 }}>
                    <span style={{ fontWeight: 600, color: '#262626' }}>{key}</span>
                    <span style={{ color: '#8c8c8c', margin: '0 6px' }}>:</span>
                    {renderJsonNode(nestedValue, depth + 1)}
                </div>
            ))}
        </div>
    );
};

export default function Home() {
    const history = useHistory();
    const initialAssistantMessage =
        "Bonjour, je suis moussAIllon, votre assistant de gestion de chantier naval.\n\n" +
        "Comment puis-je vous aider aujourd'hui ?\n\n";

    const [ prompt, setPrompt ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ mcpReady, setMcpReady ] = useState(false);
    const aiProvider: AiProvider = 'anthropic';
    const [ isHelpOpen, setIsHelpOpen ] = useState(false);
    const [ messages, setMessages ] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: initialAssistantMessage
        }
    ]);
    const chatMessagesRef = useRef<HTMLDivElement | null>(null);

    const mcpStatusColor = useMemo(() => mcpReady ? 'green' : 'orange', [ mcpReady ]);

    useEffect(() => {
        let mounted = true;
        initializeMcp()
            .then(() => {
                if (mounted) {
                    setMcpReady(true);
                }
            })
            .catch((error) => {
                if (!mounted) {
                    return;
                }
                setMcpReady(false);
                appendAssistantMessage(
                    "Connexion MCP impossible pour le moment: " +
                    (error?.message || 'erreur inconnue')
                );
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!chatMessagesRef.current) {
            return;
        }
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }, [ messages ]);

    const appendAssistantMessage = (content: string) => {
        setMessages((prev) => [ ...prev, { role: 'assistant', content } ]);
    };

    const appendUserMessage = (content: string) => {
        setMessages((prev) => [ ...prev, { role: 'user', content } ]);
    };

    const initializeMcp = async () => {
        await mcpRequest('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'moussaillon-chantier-ui',
                version: '0.9-SNAPSHOT'
            }
        });
    };

    const mcpRequest = async (method: string, params: any): Promise<JsonRpcResponse> => {
        const response = await fetch('/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method,
                params
            })
        });

        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }

        const json = await response.json() as JsonRpcResponse;
        if (json.error) {
            throw new Error(json.error.message + (json.error.data ? ' - ' + JSON.stringify(json.error.data) : ''));
        }
        return json;
    };

    const callMcpTool = async (name: string, args: any) => {
        const json = await mcpRequest('tools/call', {
            name,
            arguments: args
        });
        return json.result;
    };

    const extractAiText = (payload: any): string => {
        if (!payload) {
            return '';
        }

        if (typeof payload === 'string') {
            return payload;
        }

        if (typeof payload.answer === 'string' && payload.answer.trim()) {
            return payload.answer;
        }

        if (typeof payload.message === 'string' && payload.message.trim()) {
            return payload.message;
        }

        // Anthropic-like shape: { content: [{ type: "text", text: "..." }] }
        if (Array.isArray(payload.content)) {
            const textParts = payload.content
                .map((part: any) => {
                    if (typeof part === 'string') {
                        return part;
                    }
                    if (part && typeof part.text === 'string') {
                        return part.text;
                    }
                    return '';
                })
                .filter((part: string) => part.trim());
            if (textParts.length > 0) {
                return textParts.join('\n');
            }
        }

        // OpenAI-like shape: { choices: [{ message: { content: "..." } }] }
        if (Array.isArray(payload.choices) && payload.choices.length > 0) {
            const content = payload.choices[0]?.message?.content;
            if (typeof content === 'string' && content.trim()) {
                return content;
            }
        }

        try {
            return JSON.stringify(payload, null, 2);
        } catch (_err) {
            return String(payload);
        }
    };

    const callAiChat = async (provider: AiProvider, message: string) => {
        const response = await fetch('/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider,
                message
            })
        });

        if (!response.ok) {
            const text = await response.text();
            if (text && text.trim()) {
                throw new Error(text);
            }
            if (response.status >= 500) {
                throw new Error('Service IA indisponible temporairement (HTTP ' + response.status + ').');
            }
            throw new Error('Erreur IA HTTP ' + response.status);
        }

        const raw = await response.text();
        if (!raw.trim()) {
            return '';
        }

        try {
            const payload = JSON.parse(raw);
            return extractAiText(payload);
        } catch (_err) {
            return raw;
        }
    };

    const askPlanner = async (userInput: string) => {
        const plannerPrompt = buildPlannerPrompt(userInput);
        try {
            const answer = await callAiChat(aiProvider, plannerPrompt);
            return {
                answer,
                providerUsed: aiProvider,
                fallbackUsed: false,
                errors: [] as string[]
            };
        } catch (primaryError: any) {
            return {
                answer: '',
                providerUsed: aiProvider,
                fallbackUsed: false,
                errors: [ primaryError?.message || 'Erreur Claude inconnue' ]
            };
        }
    };

    const parseAiDirective = (aiOutput: string): AiMcpDirective | null => {
        const candidate = extractJsonCandidate(aiOutput);
        if (!candidate.startsWith('{')) {
            return null;
        }
        try {
            const parsed = JSON.parse(candidate) as AiMcpDirective;
            if (!parsed || !parsed.action) {
                return null;
            }
            if (parsed.action === 'mcp_call' && parsed.method && parsed.path) {
                return parsed;
            }
            if (parsed.action === 'reply' && parsed.message) {
                return parsed;
            }
            return null;
        } catch (_err) {
            return null;
        }
    };

    const buildPlannerPrompt = (userInput: string) =>
        "Tu es un moussAIllon, un assistant de gestion de chantier naval.\n" +
        "Réponds UNIQUEMENT en JSON valide, sans texte hors JSON.\n" +
        "Si une action API est utile, renvoie:\n" +
        "{\"action\":\"mcp_call\",\"method\":\"GET|POST|PUT|DELETE\",\"path\":\"/...\",\"query\":{...},\"body\":{...}}\n" +
        "Sinon renvoie:\n" +
        "{\"action\":\"reply\",\"message\":\"...\"}\n" +
        "Règles: path doit commencer par '/'. N'invente pas de clé sensible.\n" +
        "Question utilisateur: " + userInput;

    const parseJsonInput = (value: string | undefined, errorPrefix: string) => {
        if (!value || !value.trim()) {
            return undefined;
        }
        try {
            return JSON.parse(value);
        } catch (_err) {
            throw new Error(errorPrefix + " invalide. Utilisez un JSON objet valide.");
        }
    };

    const resolveResourcePath = (input: string) => {
        const normalized = input.toLowerCase();
        if (normalized.includes('client')) {
            return '/clients';
        }
        if (normalized.includes('bateau')) {
            return '/bateaux';
        }
        if (normalized.includes('moteur')) {
            return '/moteurs';
        }
        if (normalized.includes('remorque')) {
            return '/remorques';
        }
        if (normalized.includes('forfait')) {
            return '/forfaits';
        }
        if (normalized.includes('service')) {
            return '/services';
        }
        if (normalized.includes('vente')) {
            return '/ventes';
        }
        if (normalized.includes('technicien') || normalized.includes('techniciens')) {
            return '/techniciens';
        }
        if (normalized.includes('competence') || normalized.includes('compétence')) {
            return '/competences';
        }
        return null;
    };

    const extractJsonBlock = (input: string) => {
        const start = input.indexOf('{');
        if (start < 0) {
            return null;
        }
        const jsonCandidate = input.slice(start).trim();
        return jsonCandidate || null;
    };

    const tryParseNaturalLanguage = (input: string): ParsedInstruction | null => {
        const lower = input.toLowerCase().trim();

        if (!lower) {
            return null;
        }

        if (lower === 'resources' || lower === 'ressources' || lower.includes('liste des ressources')) {
            return {
                method: 'GET',
                path: '/_resources',
                translatedCommand: 'resources'
            };
        }

        const resourcePath = resolveResourcePath(lower);
        if (!resourcePath) {
            return null;
        }

        const idMatch = lower.match(/\b(\d+)\b/);
        const id = idMatch ? idMatch[1] : null;

        const isDelete = /\b(supprime|supprimer|delete|efface|retire)\b/.test(lower);
        if (isDelete && id) {
            return {
                method: 'DELETE',
                path: resourcePath + '/' + id,
                translatedCommand: 'DELETE ' + resourcePath + '/' + id
            };
        }

        const isCreate = /\b(cr[eé]e|ajoute|nouveau|nouvelle|insert)\b/.test(lower);
        if (isCreate) {
            const jsonBlock = extractJsonBlock(input);
            if (!jsonBlock) {
                throw new Error("Pour une création, ajoutez un JSON, ex: crée un client {\"prenom\":\"Jean\"}");
            }
            return {
                method: 'POST',
                path: resourcePath,
                body: parseJsonInput(jsonBlock, 'Le body'),
                translatedCommand: 'POST ' + resourcePath + ' ' + jsonBlock
            };
        }

        const isUpdate = /\b(modifie|modifier|mets?\s+a\s+jour|update)\b/.test(lower);
        if (isUpdate) {
            if (!id) {
                throw new Error('Pour une mise à jour, précisez un id, ex: modifie le client 12 {...}');
            }
            const jsonBlock = extractJsonBlock(input);
            if (!jsonBlock) {
                throw new Error("Pour une mise à jour, ajoutez un JSON, ex: modifie le client 12 {\"nom\":\"Dupont\"}");
            }
            return {
                method: 'PUT',
                path: resourcePath + '/' + id,
                body: parseJsonInput(jsonBlock, 'Le body'),
                translatedCommand: 'PUT ' + resourcePath + '/' + id + ' ' + jsonBlock
            };
        }

        const searchMatch = lower.match(/\b(cherche|recherche|trouve|filtre)\b/);
        if (searchMatch) {
            const explicitTerm = lower.match(/(?:cherche|recherche|trouve|filtre)\s+(.+)/);
            let q = explicitTerm ? explicitTerm[1] : '';
            q = q.replace(/\bdans\b.*$/, '').trim();
            q = q.replace(/\bles?\b|\bla\b|\ble\b|\bdes?\b|\bdu\b|\bde\b/g, ' ').replace(/\s+/g, ' ').trim();
            if (!q) {
                throw new Error("Précisez un terme de recherche, ex: cherche dupont dans les clients");
            }
            return {
                method: 'GET',
                path: resourcePath + '/search',
                query: { q },
                translatedCommand: 'GET ' + resourcePath + '/search ' + JSON.stringify({ q })
            };
        }

        const isList = /\b(liste|affiche|montre|voir|consulte)\b/.test(lower);
        if (isList) {
            return {
                method: 'GET',
                path: resourcePath,
                translatedCommand: 'GET ' + resourcePath
            };
        }

        if (id) {
            return {
                method: 'GET',
                path: resourcePath + '/' + id,
                translatedCommand: 'GET ' + resourcePath + '/' + id
            };
        }

        return null;
    };

    const executeApiInstruction = async (instruction: ParsedInstruction) => {
        if (instruction.path === '/_resources') {
            const toolResult = await callMcpTool('moussaillon_list_api_resources', {});
            const firstContent = toolResult?.content?.[0]?.text || '{}';
            appendAssistantMessage(firstContent);
            return;
        }

        appendAssistantMessage('Interprétation: `' + instruction.translatedCommand + '`');

        const args: any = {
            method: instruction.method,
            path: instruction.path
        };
        if (instruction.query !== undefined) {
            args.query = instruction.query;
        }
        if (instruction.body !== undefined) {
            args.body = instruction.body;
        }

        const toolResult = await callMcpTool('moussaillon_call_api_resource', args);
        const firstContent = toolResult?.content?.[0]?.text;
        if (firstContent) {
            appendAssistantMessage(firstContent);
            const destination = resolveUiRouteFromApiPath(instruction.path);
            if (destination) {
                history.push(destination);
            }
            return;
        }
        appendAssistantMessage(JSON.stringify(toolResult || {}, null, 2));
        const destination = resolveUiRouteFromApiPath(instruction.path);
        if (destination) {
            history.push(destination);
        }
    };

    const resolveUiRouteFromApiPath = (apiPath: string) => {
        const normalized = (apiPath || '').toLowerCase();
        const map: Array<{ match: string; route: string }> = [
            { match: '/clients', route: '/clients' },
            { match: '/bateaux', route: '/clients/bateaux' },
            { match: '/moteurs', route: '/clients/moteurs' },
            { match: '/remorques', route: '/clients/remorques' },
            { match: '/forfaits', route: '/forfaits' },
            { match: '/services', route: '/services' },
            { match: '/ventes', route: '/prestations' },
            { match: '/techniciens', route: '/techniciens' },
            { match: '/competences', route: '/competences' }
        ];
        const found = map.find((item) => normalized.includes(item.match));
        return found ? found.route : null;
    };

    const handleCommand = async (rawInput: string) => {
        const input = rawInput.trim();
        if (!input) {
            return;
        }

        appendUserMessage(input);

        const lower = input.toLowerCase();
        if (lower === 'help') {
            appendAssistantMessage(
                "Exemples:\n" +
                "- resources\n" +
                "- GET /clients\n" +
                "- GET /clients/search {\"q\":\"dupont\"}\n" +
                "- POST /clients {\"prenom\":\"Jean\",\"nom\":\"Dupont\"}\n" +
                "- liste les clients\n" +
                "- cherche dupont dans les clients\n" +
                "- supprime le client 12"
            );
            return;
        }

        if (lower === 'resources') {
            await executeApiInstruction({
                method: 'GET',
                path: '/_resources',
                translatedCommand: 'resources'
            });
            return;
        }

        const match = input.match(/^(GET|POST|PUT|DELETE)\s+(\S+)(?:\s+(.+))?$/i);
        if (!match) {
            const naturalLanguageInstruction = tryParseNaturalLanguage(input);
            if (naturalLanguageInstruction) {
                await executeApiInstruction(naturalLanguageInstruction);
                return;
            }

            const plannerRun = await askPlanner(input);
            const plannerAnswer = plannerRun.answer;

            if (!plannerAnswer || !plannerAnswer.trim()) {
                const details = plannerRun.errors.filter(Boolean).join(" | ");
                appendAssistantMessage(
                    "Commande non reconnue et IA indisponible.\n" +
                    "Détail: " + (details || "Aucune réponse de Claude") + "\n" +
                    "Vérifiez la configuration backend Claude (clé API, endpoint, réseau) ou utilisez GET/POST explicite."
                );
                return;
            }

            const directive = parseAiDirective(plannerAnswer);
            if (directive && directive.action === 'mcp_call' && directive.method && directive.path) {
                await executeApiInstruction({
                    method: directive.method,
                    path: directive.path,
                    query: directive.query,
                    body: directive.body,
                    translatedCommand: directive.method + ' ' + directive.path
                });
                return;
            }
            if (directive && directive.action === 'reply' && directive.message) {
                appendAssistantMessage(directive.message);
                return;
            }
            if (plannerAnswer.trim()) {
                appendAssistantMessage(plannerAnswer);
                return;
            }

            appendAssistantMessage(
                "La réponse IA n'a pas pu être interprétée.\n" +
                "Essayez une commande GET/POST explicite."
            );
            return;
        }

        const method = match[1].toUpperCase();
        const path = match[2];
        const payloadPart = match[3];

        const args: any = { method, path };
        if (method === 'GET' || method === 'DELETE') {
            const query = parseJsonInput(payloadPart, "Le parametre query");
            if (query !== undefined) {
                args.query = query;
            }
        } else {
            const body = parseJsonInput(payloadPart, 'Le body');
            if (body !== undefined) {
                args.body = body;
            }
        }

        await executeApiInstruction({
            method: args.method,
            path: args.path,
            query: args.query,
            body: args.body,
            translatedCommand: input
        });
    };

    const onSend = async () => {
        if (!prompt.trim() || loading) {
            return;
        }
        const currentPrompt = prompt;
        setPrompt('');
        setLoading(true);
        try {
            await handleCommand(currentPrompt);
        } catch (error: any) {
            appendAssistantMessage("Erreur: " + (error?.message || 'inconnue'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card bordered={false} style={{ marginBottom: 24, background: '#fafafa' }}>
                <Row align="middle">
                    <Col flex="40px">
                        <SmileOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                    </Col>
                    <Col flex="auto" style={{ paddingLeft: 16 }}>
                        <Title level={2} style={{ marginBottom: 0 }}>Bienvenue moussAIllon</Title>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            Gérez vos clients, bateaux, moteurs, remorques et plus encore en toute simplicité.<br />
                            Utilisez le menu latéral pour naviguer entre les différentes fonctionnalités.<br />
                            Nous vous souhaitons une excellente expérience sur notre plateforme.
                        </Paragraph>
                    </Col>
                </Row>
            </Card>

            <Card
                title={
                    <Space>
                        <RobotOutlined />
                        Assistant IA
                        <Tag color={mcpStatusColor}>{mcpReady ? 'Connecté' : 'En attente'}</Tag>
                    </Space>
                }
            >

                <div
                    ref={chatMessagesRef}
                    style={{
                        height: 350,
                        maxHeight: 350,
                        overflowY: 'auto',
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        padding: 12,
                        background: '#fff'
                    }}
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: 12,
                                textAlign: message.role === 'user' ? 'right' : 'left'
                            }}
                        >
                            <Tag color={message.role === 'user' ? 'blue' : 'purple'}>
                                {message.role === 'user' ? 'Vous' : 'Assistant'}
                            </Tag>
                            {(() => {
                                const parsedJson = message.role === 'assistant'
                                    ? tryParseJsonForDisplay(message.content)
                                    : null;
                                if (parsedJson) {
                                    return (
                                        <div
                                            style={{
                                                marginTop: 6,
                                                marginBottom: 0,
                                                padding: 10,
                                                borderRadius: 8,
                                                background: '#fafafa',
                                                border: '1px solid #f0f0f0',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            {renderJsonNode(parsedJson)}
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>
                                        {message.content}
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Tag>Provider IA</Tag>
                        <Tag color="purple">Claude (Anthropic)</Tag>
                    </Space>
                    <TextArea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={"Posez une question."}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                    />
                    <Space>
                        <Button icon={<QuestionCircleOutlined />} onClick={() => setIsHelpOpen(true)}>
                            Help
                        </Button>
                        <Button onClick={() => setPrompt('resources')}>Resources</Button>
                        <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={onSend}>
                            Envoyer
                        </Button>
                    </Space>
                </Space>
            </Card>

            <Modal
                title="Aide du chatbot moussAIllon"
                open={isHelpOpen}
                onCancel={() => setIsHelpOpen(false)}
                onOk={() => setIsHelpOpen(false)}
                okText="Fermer"
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <Paragraph>
                    Le chatbot accepte des commandes API directes, du langage naturel et des questions libres.
                </Paragraph>
                <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {"Commandes directes:\n" +
                        "- resources\n" +
                        "- GET /clients/search {\"q\":\"dupont\"}\n" +
                        "- POST /clients {\"prenom\":\"Jean\",\"nom\":\"Dupont\"}\n" +
                        "- PUT /clients/1 {...}\n" +
                        "- DELETE /clients/1\n\n" +
                        "Langage naturel (FR):\n" +
                        "- liste les clients\n" +
                        "- cherche dupont dans les clients\n" +
                        "- supprime le client 12\n" +
                        "- crée un client {\"prenom\":\"Jean\",\"nom\":\"Dupont\"}\n\n" +
                        "Conseil: utilisez Shift+Entrée pour un retour à la ligne et Entrée pour envoyer."}
                </Paragraph>
            </Modal>
        </>
    );
}