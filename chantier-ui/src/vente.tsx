import React, { useEffect, useMemo, useState } from 'react';
import {
    AutoComplete,
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Rate,
    Row,
    Select,
    Space,
    Tabs,
    Table,
    Tag,
    Dropdown,
    message
} from 'antd';
import { CalendarOutlined, CreditCardOutlined, DeleteOutlined, EditOutlined, MailOutlined, PlusCircleOutlined, PlusOutlined, PrinterOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import ImageUpload from './ImageUpload.tsx';

interface ClientEntity {
    id: number;
    prenom?: string;
    nom: string;
    email?: string;
}

interface BateauClientEntity {
    id: number;
    name?: string;
    immatriculation?: string;
}

interface MoteurClientEntity {
    id: number;
    numeroSerie?: string;
}

interface RemorqueClientEntity {
    id: number;
    immatriculation?: string;
}

interface TechnicienEntity {
    id: number;
    prenom?: string;
    nom?: string;
}

type PlanningStatus = 'EN_ATTENTE' | 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'INCIDENT' | 'ANNULEE';

interface TaskEntity {
    id?: number;
    nom?: string;
    description?: string;
    done?: boolean;
}

interface VenteForfaitEntity {
    id?: number;
    forfait?: ForfaitEntity;
    quantite?: number;
    technicien?: TechnicienEntity;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    status?: PlanningStatus;
    statusDate?: string;
    dureeReelle?: number;
    incidentDate?: string;
    incidentDetails?: string;
    notes?: string;
    taches?: TaskEntity[];
}

interface VenteServiceEntity {
    id?: number;
    service?: ServiceEntity;
    quantite?: number;
    technicien?: TechnicienEntity;
    datePlanification?: string;
    dateDebut?: string;
    dateFin?: string;
    status?: PlanningStatus;
    statusDate?: string;
    dureeReelle?: number;
    incidentDate?: string;
    incidentDetails?: string;
    notes?: string;
    taches?: TaskEntity[];
}

interface ForfaitEntity {
    id: number;
    reference?: string;
    nom: string;
    prixHT?: number;
    tva?: number;
    montantTVA?: number;
    prixTTC?: number;
    taches?: TaskEntity[];
}

const defaultNewForfait = {
    reference: '', nom: '', prixHT: 0, tva: 20, montantTVA: 0, prixTTC: 0,
};

interface ProduitCatalogueEntity {
    id: number;
    nom: string;
    marque?: string;
    categorie?: string;
    ref?: string;
    refs?: string[];
    images?: string[];
    description?: string;
    evaluation?: number;
    stock?: number;
    stockMini?: number;
    emplacement?: string;
    prixPublic?: number;
    frais?: number;
    tauxMarge?: number;
    tauxMarque?: number;
    prixVenteHT?: number;
    tva?: number;
    montantTVA?: number;
    prixVenteTTC?: number;
}

const PRODUIT_CATEGORIES = [
    { text: 'Pièces Moteur', value: 'Pièces Moteur', label: 'Pièces Moteur' },
    { text: 'Pièces Remorque', value: 'Pièces Remorque', label: 'Pièces Remorque' },
    { text: 'Electronique', value: 'Electronique', label: 'Electronique' },
    { text: 'Sécurité', value: 'Sécurité', label: 'Sécurité' },
    { text: 'Equipement & Accessoires', value: 'Equipement & Accessoires', label: 'Equipement & Accessoires' },
    { text: 'Loisirs', value: 'Loisirs', label: 'Loisirs' },
];

const defaultNewProduit = {
    nom: '',
    marque: '',
    categorie: '',
    ref: '',
    refs: [],
    images: [],
    description: '',
    evaluation: 0,
    stock: 0,
    stockMini: 0,
    emplacement: '',
    prixPublic: 0,
    frais: 0,
    tauxMarge: 0,
    tauxMarque: 0,
    prixVenteHT: 0,
    tva: 20,
    montantTVA: 0,
    prixVenteTTC: 0,
};

interface MainOeuvreEntity {
    id: number;
    nom: string;
    description?: string;
    prixHT?: number;
    tva?: number;
    montantTVA?: number;
    prixTTC?: number;
}

interface ServiceMainOeuvreEntity {
    id?: number;
    mainOeuvre?: MainOeuvreEntity;
    quantite: number;
}

interface ServiceProduitEntity {
    id?: number;
    produit?: ProduitCatalogueEntity;
    quantite: number;
}

interface ServiceEntity {
    id: number;
    nom: string;
    description?: string;
    dureeEstimee?: number;
    mainOeuvres?: ServiceMainOeuvreEntity[];
    produits?: ServiceProduitEntity[];
    prixHT?: number;
    tva?: number;
    montantTVA?: number;
    prixTTC?: number;
}

const defaultNewService = {
    nom: '', description: '',
    dureeEstimee: 0,
    mainOeuvres: [{}] as Array<{ mainOeuvreId?: number; quantite?: number }>,
    produits: [{}] as Array<{ produitId?: number; quantite?: number }>,
    prixHT: 0, tva: 20, montantTVA: 0, prixTTC: 0,
};

type VenteStatus = 'EN_ATTENTE' | 'EN_COURS' | 'PAYEE' | 'ANNULEE';
type VenteType = 'DEVIS' | 'FACTURE' | 'COMMANDE' | 'LIVRAISON' | 'COMPTOIR';
type ModePaiement = 'CHEQUE' | 'VIREMENT' | 'CARTE' | 'ESPÈCES';

interface VenteEntity {
    id?: number;
    status: VenteStatus;
    type: VenteType;
    client?: ClientEntity;
    bateau?: BateauClientEntity;
    moteur?: MoteurClientEntity;
    remorque?: RemorqueClientEntity;
    venteForfaits?: VenteForfaitEntity[];
    venteServices?: VenteServiceEntity[];
    produits?: ProduitCatalogueEntity[];
    date?: string;
    montantHT?: number;
    remise?: number;
    montantTTC?: number;
    tva?: number;
    montantTVA?: number;
    prixVenteTTC?: number;
    modePaiement?: ModePaiement;
    rappel1Jours?: number;
    rappel2Jours?: number;
    rappel3Jours?: number;
}

interface RappelHistoriqueEntity {
    id: number;
    numeroRappel: number;
    destinataire: string;
    sujet: string;
    contenu: string;
    dateEnvoi?: string;
}

interface VenteFormValues {
    status: VenteStatus;
    type: VenteType;
    clientId?: number;
    bateauId?: number;
    moteurId?: number;
    remorqueId?: number;
    venteForfaits: Array<{
        forfaitId?: number;
        quantite?: number;
        technicienId?: number;
        status?: PlanningStatus;
        datePlanification?: string;
        dateDebut?: string;
        dateFin?: string;
        dureeReelle?: number;
        notes?: string;
        incidentDate?: string;
        incidentDetails?: string;
        taches?: Array<{ nom?: string; description?: string; done?: boolean }>;
    }>;
    venteServices: Array<{
        serviceId?: number;
        quantite?: number;
        technicienId?: number;
        status?: PlanningStatus;
        datePlanification?: string;
        dateDebut?: string;
        dateFin?: string;
        dureeReelle?: number;
        notes?: string;
        incidentDate?: string;
        incidentDetails?: string;
        taches?: Array<{ nom?: string; description?: string; done?: boolean }>;
    }>;
    produits: Array<{ produitId?: number; quantite?: number }>;
    date?: string;
    montantHT: number;
    remise: number;
    remisePourcentage: number;
    tva: number;
    montantTVA: number;
    montantTTC: number;
    prixVenteTTC: number;
    modePaiement?: ModePaiement;
    rappel1Jours?: number;
    rappel2Jours?: number;
    rappel3Jours?: number;
}

interface SearchFilters {
    status?: VenteStatus;
    type?: VenteType;
    clientId?: number;
}

const statusOptions: Array<{ value: VenteStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'PAYEE', label: 'Payee' },
    { value: 'ANNULEE', label: 'Annulee' }
];

const typeOptions: Array<{ value: VenteType; label: string }> = [
    { value: 'DEVIS', label: 'Devis' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'COMMANDE', label: 'Commande' },
    { value: 'LIVRAISON', label: 'Livraison' },
    { value: 'COMPTOIR', label: 'Comptoir' }
];

const modePaiementOptions: Array<{ value: ModePaiement; label: string }> = [
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'VIREMENT', label: 'Virement' },
    { value: 'CARTE', label: 'Carte' },
    { value: 'ESPÈCES', label: 'Especes' }
];

const planningStatusOptions: Array<{ value: PlanningStatus; label: string }> = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'PLANIFIEE', label: 'Planifiee' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINEE', label: 'Terminee' },
    { value: 'INCIDENT', label: 'Incident' },
    { value: 'ANNULEE', label: 'Annulee' }
];

const statusColor: Record<VenteStatus, string> = {
    EN_ATTENTE: 'default',
    EN_COURS: 'blue',
    PAYEE: 'green',
    ANNULEE: 'red'
};

const getTodayIsoDate = () => {
    const now = new Date();
    const timezoneOffsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - timezoneOffsetMs).toISOString().split('T')[0];
};

const toDateInputValue = (value?: string) => {
    if (!value) {
        return undefined;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    // Handle ISO datetime like "2025-06-15T10:00:00"
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return value.slice(0, 10);
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }
    const timezoneOffsetMs = parsedDate.getTimezoneOffset() * 60000;
    return new Date(parsedDate.getTime() - timezoneOffsetMs).toISOString().split('T')[0];
};


const toBackendDateValue = (value?: string) => {
    if (!value) {
        return undefined;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }
    return parsedDate.toISOString().split('T')[0];
};

const defaultVente: VenteFormValues = {
    status: 'EN_ATTENTE',
    type: 'DEVIS',
    venteForfaits: [{ status: 'EN_ATTENTE' }],
    venteServices: [{ status: 'EN_ATTENTE' }],
    produits: [{}],
    montantHT: 0,
    remise: 0,
    remisePourcentage: 0,
    tva: 20,
    montantTVA: 0,
    montantTTC: 0,
    prixVenteTTC: 0
};

const formatEuro = (value?: number) => `${(value || 0).toFixed(2)} EUR`;
const formatDate = (value?: string) => value || '-';
const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const getClientLabel = (client?: ClientEntity) => {
    if (!client) {
        return '-';
    }
    const fullName = `${client.prenom || ''} ${client.nom || ''}`.trim();
    return fullName || `Client #${client.id}`;
};

export default function Vente() {
    const history = useHistory();
    const [ventes, setVentes] = useState<VenteEntity[]>([]);
    const [clients, setClients] = useState<ClientEntity[]>([]);
    const [bateaux, setBateaux] = useState<BateauClientEntity[]>([]);
    const [moteurs, setMoteurs] = useState<MoteurClientEntity[]>([]);
    const [remorques, setRemorques] = useState<RemorqueClientEntity[]>([]);
    const [forfaits, setForfaits] = useState<ForfaitEntity[]>([]);
    const [produits, setProduits] = useState<ProduitCatalogueEntity[]>([]);
    const [services, setServices] = useState<ServiceEntity[]>([]);
    const [mainOeuvres, setMainOeuvres] = useState<MainOeuvreEntity[]>([]);
    const [techniciens, setTechniciens] = useState<TechnicienEntity[]>([]);
    const [catalogueBateaux, setCatalogueBateaux] = useState<Array<{ id: number; marque?: string; modele?: string }>>([]);
    const [catalogueMoteurs, setCatalogueMoteurs] = useState<Array<{ id: number; marque?: string; modele?: string }>>([]);
    const [catalogueRemorques, setCatalogueRemorques] = useState<Array<{ id: number; marque?: string; modele?: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentVente, setCurrentVente] = useState<VenteEntity | null>(null);
    const [rappelHistorique, setRappelHistorique] = useState<RappelHistoriqueEntity[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [searchForm] = Form.useForm<SearchFilters>();
    const [form] = Form.useForm<VenteFormValues>();
    const [newProduitModalVisible, setNewProduitModalVisible] = useState(false);
    const [newProduitTargetLine, setNewProduitTargetLine] = useState<number | null>(null);
    const [newProduitForm] = Form.useForm();
    const [newServiceModalVisible, setNewServiceModalVisible] = useState(false);
    const [newServiceTargetLine, setNewServiceTargetLine] = useState<number | null>(null);
    const [editServiceId, setEditServiceId] = useState<number | null>(null);
    const [newServiceForm] = Form.useForm();
    const [newForfaitModalVisible, setNewForfaitModalVisible] = useState(false);
    const [newForfaitTargetLine, setNewForfaitTargetLine] = useState<number | null>(null);
    const [newForfaitForm] = Form.useForm();
    const [newClientModalVisible, setNewClientModalVisible] = useState(false);
    const [newClientForm] = Form.useForm();
    const [newBateauModalVisible, setNewBateauModalVisible] = useState(false);
    const [newBateauForm] = Form.useForm();
    const [newMoteurModalVisible, setNewMoteurModalVisible] = useState(false);
    const [newMoteurForm] = Form.useForm();
    const [newRemorqueModalVisible, setNewRemorqueModalVisible] = useState(false);
    const [newRemorqueForm] = Form.useForm();

    const marqueOptions = useMemo(() => {
        const unique = Array.from(new Set(produits.map((p) => p.marque).filter(Boolean))) as string[];
        return unique.map((marque) => ({ value: marque }));
    }, [produits]);

    const clientOptions = useMemo(
        () => clients.map((client) => ({ value: client.id, label: getClientLabel(client) })),
        [clients]
    );

    const bateauOptions = useMemo(
        () => bateaux.map((bateau) => ({ value: bateau.id, label: bateau.name || bateau.immatriculation || `Bateau #${bateau.id}` })),
        [bateaux]
    );

    const moteurOptions = useMemo(
        () => moteurs.map((moteur) => ({ value: moteur.id, label: moteur.numeroSerie || `Moteur #${moteur.id}` })),
        [moteurs]
    );

    const remorqueOptions = useMemo(
        () => remorques.map((remorque) => ({ value: remorque.id, label: remorque.immatriculation || `Remorque #${remorque.id}` })),
        [remorques]
    );

    const forfaitOptions = useMemo(
        () =>
            forfaits.map((forfait) => ({
                value: forfait.id,
                label: forfait.reference ? `${forfait.reference} - ${forfait.nom}` : forfait.nom,
                searchText: (forfait.reference || '').toLowerCase()
            })),
        [forfaits]
    );

    const produitOptions = useMemo(
        () => produits.map((produit) => ({ value: produit.id, label: `${produit.nom}${produit.marque ? ` (${produit.marque})` : ''}` })),
        [produits]
    );

    const serviceOptions = useMemo(
        () => services.map((service) => ({ value: service.id, label: service.nom })),
        [services]
    );

    const mainOeuvreOptions = useMemo(
        () => mainOeuvres.map((mo) => ({ value: mo.id, label: mo.nom })),
        [mainOeuvres]
    );

    const produitOptionsForService = useMemo(
        () => produits.map((p) => ({ value: p.id, label: `${p.nom}${p.marque ? ` (${p.marque})` : ''}` })),
        [produits]
    );

    const technicienOptions = useMemo(
        () =>
            techniciens.map((technicien) => ({
                value: technicien.id,
                label: `${technicien.prenom || ''} ${technicien.nom || ''}`.trim() || `Technicien #${technicien.id}`
            })),
        [techniciens]
    );

    const fetchVentes = async (nextFilters?: SearchFilters) => {
        setLoading(true);
        try {
            const activeFilters = nextFilters || {};
            const hasStatus = !!activeFilters.status;
            const hasType = !!activeFilters.type;
            const hasClient = activeFilters.clientId !== undefined;
            const endpoint = hasStatus || hasType || hasClient ? '/ventes/search' : '/ventes';
            const response = await axios.get(endpoint, {
                params: {
                    ...(hasStatus ? { status: activeFilters.status } : {}),
                    ...(hasType ? { type: activeFilters.type } : {}),
                    ...(hasClient ? { clientId: activeFilters.clientId } : {})
                }
            });
            setVentes(response.data || []);
        } catch {
            message.error('Erreur lors du chargement des ventes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [
                clientsRes,
                bateauxRes,
                moteursRes,
                remorquesRes,
                forfaitsRes,
                produitsRes,
                servicesRes,
                mainOeuvresRes,
                techniciensRes,
                catBateauxRes,
                catMoteursRes,
                catRemorquesRes
            ] = await Promise.all([
                axios.get('/clients'),
                axios.get('/bateaux'),
                axios.get('/moteurs'),
                axios.get('/remorques'),
                axios.get('/forfaits'),
                axios.get('/catalogue/produits'),
                axios.get('/services'),
                axios.get('/main-oeuvres'),
                axios.get('/techniciens'),
                axios.get('/catalogue/bateaux'),
                axios.get('/catalogue/moteurs'),
                axios.get('/catalogue/remorques')
            ]);
            setClients(clientsRes.data || []);
            setBateaux(bateauxRes.data || []);
            setMoteurs(moteursRes.data || []);
            setRemorques(remorquesRes.data || []);
            setForfaits(forfaitsRes.data || []);
            setProduits(produitsRes.data || []);
            setServices(servicesRes.data || []);
            setMainOeuvres(mainOeuvresRes.data || []);
            setTechniciens(techniciensRes.data || []);
            setCatalogueBateaux(catBateauxRes.data || []);
            setCatalogueMoteurs(catMoteursRes.data || []);
            setCatalogueRemorques(catRemorquesRes.data || []);
        } catch {
            message.error('Erreur lors du chargement des listes de reference.');
        }
    };

    useEffect(() => {
        fetchVentes();
        fetchOptions();
    }, []);

    const openNewProduitModal = (lineIndex: number) => {
        setNewProduitTargetLine(lineIndex);
        newProduitForm.resetFields();
        newProduitForm.setFieldsValue(defaultNewProduit);
        setNewProduitModalVisible(true);
    };

    const handleNewProduitSave = async () => {
        try {
            const values = await newProduitForm.validateFields();
            values.images = values.images || [];
            const res = await axios.post('/catalogue/produits', values);
            const created = res.data as ProduitCatalogueEntity;
            message.success('Produit ajouté avec succès');
            setProduits((prev) => [...prev, created]);
            if (newProduitTargetLine !== null && created.id) {
                const currentLines = form.getFieldValue('produits') || [];
                const updated = [...currentLines];
                updated[newProduitTargetLine] = { ...updated[newProduitTargetLine], produitId: created.id };
                form.setFieldValue('produits', updated);
                recalculateFromLines('auto');
            }
            setNewProduitModalVisible(false);
        } catch {
            // validation errors shown in form
        }
    };

    const onNewProduitValuesChange = (changedValues: Record<string, unknown>) => {
        if (changedValues.prixVenteHT !== undefined || changedValues.tva !== undefined) {
            const prixVenteHT = newProduitForm.getFieldValue('prixVenteHT') || 0;
            const tva = newProduitForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round(((prixVenteHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
            newProduitForm.setFieldValue('montantTVA', montantTVA);
            const prixVenteTTC = Math.round(((prixVenteHT + montantTVA) + Number.EPSILON) * 100) / 100;
            newProduitForm.setFieldValue('prixVenteTTC', prixVenteTTC);
        }
        if (changedValues.prixVenteTTC !== undefined) {
            const prixVenteTTC = newProduitForm.getFieldValue('prixVenteTTC') || 0;
            const tva = newProduitForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round((((prixVenteTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            newProduitForm.setFieldValue('montantTVA', montantTVA);
            const prixVenteHT = Math.round(((prixVenteTTC - montantTVA) + Number.EPSILON) * 100) / 100;
            newProduitForm.setFieldValue('prixVenteHT', prixVenteHT);
        }
    };

    const openNewServiceModal = (lineIndex: number) => {
        setNewServiceTargetLine(lineIndex);
        setEditServiceId(null);
        newServiceForm.resetFields();
        newServiceForm.setFieldsValue(defaultNewService);
        setNewServiceModalVisible(true);
    };

    const openEditServiceModal = (serviceId: number) => {
        setNewServiceTargetLine(null);
        setEditServiceId(serviceId);
        const service = services.find((s) => s.id === serviceId);
        if (!service) return;
        newServiceForm.resetFields();
        newServiceForm.setFieldsValue({
            nom: service.nom || '',
            description: service.description || '',
            dureeEstimee: service.dureeEstimee || 0,
            mainOeuvres: (service.mainOeuvres || [])
                .filter((item) => item.mainOeuvre?.id)
                .map((item) => ({ mainOeuvreId: item.mainOeuvre!.id, quantite: item.quantite || 1 }))
                .concat([{}]),
            produits: (service.produits || [])
                .filter((item) => item.produit?.id)
                .map((item) => ({ produitId: item.produit!.id, quantite: item.quantite || 1 }))
                .concat([{}]),
            prixHT: service.prixHT || 0,
            tva: service.tva || 0,
            montantTVA: service.montantTVA || 0,
            prixTTC: service.prixTTC || 0,
        });
        setNewServiceModalVisible(true);
    };

    const handleNewServiceSave = async () => {
        try {
            const values = await newServiceForm.validateFields();
            const payload = {
                nom: values.nom,
                description: values.description,
                dureeEstimee: values.dureeEstimee || 0,
                mainOeuvres: (values.mainOeuvres || [])
                    .filter((item: { mainOeuvreId?: number }) => item.mainOeuvreId)
                    .map((item: { mainOeuvreId?: number; quantite?: number }) => ({
                        mainOeuvre: mainOeuvres.find((mo) => mo.id === item.mainOeuvreId),
                        quantite: item.quantite || 1
                    })),
                produits: (values.produits || [])
                    .filter((item: { produitId?: number }) => item.produitId)
                    .map((item: { produitId?: number; quantite?: number }) => ({
                        produit: produits.find((p) => p.id === item.produitId),
                        quantite: item.quantite || 1
                    })),
                prixHT: values.prixHT || 0,
                tva: values.tva || 0,
                montantTVA: values.montantTVA || 0,
                prixTTC: values.prixTTC || 0
            };
            if (editServiceId) {
                const res = await axios.put(`/services/${editServiceId}`, { id: editServiceId, ...payload });
                const updated = res.data as ServiceEntity;
                message.success('Service modifié avec succès');
                setServices((prev) => prev.map((s) => s.id === editServiceId ? updated : s));
                recalculateFromLines('auto');
            } else {
                const res = await axios.post('/services', payload);
                const created = res.data as ServiceEntity;
                message.success('Service ajouté avec succès');
                setServices((prev) => [...prev, created]);
                if (newServiceTargetLine !== null && created.id) {
                    const currentLines = form.getFieldValue('venteServices') || [];
                    const updatedLines = [...currentLines];
                    updatedLines[newServiceTargetLine] = { ...updatedLines[newServiceTargetLine], serviceId: created.id };
                    form.setFieldValue('venteServices', updatedLines);
                    recalculateFromLines('auto');
                }
            }
            setNewServiceModalVisible(false);
        } catch {
            // validation errors shown in form
        }
    };

    const onNewServiceValuesChange = (changedValues: Record<string, unknown>) => {
        // Auto-add new line when last line is complete
        if (changedValues.mainOeuvres !== undefined) {
            const currentLines = newServiceForm.getFieldValue('mainOeuvres') || [];
            if (currentLines.length === 0) {
                newServiceForm.setFieldValue('mainOeuvres', [{}]);
                return;
            }
            const lastLine = currentLines[currentLines.length - 1];
            if (!!lastLine?.mainOeuvreId && (lastLine?.quantite || 0) > 0) {
                newServiceForm.setFieldValue('mainOeuvres', [...currentLines, {}]);
            }
        }
        if (changedValues.produits !== undefined) {
            const currentLines = newServiceForm.getFieldValue('produits') || [];
            if (currentLines.length === 0) {
                newServiceForm.setFieldValue('produits', [{}]);
                return;
            }
            const lastLine = currentLines[currentLines.length - 1];
            if (!!lastLine?.produitId && (lastLine?.quantite || 0) > 0) {
                newServiceForm.setFieldValue('produits', [...currentLines, {}]);
            }
        }

        // Recalculate totals from lines
        if (changedValues.mainOeuvres !== undefined || changedValues.produits !== undefined) {
            const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
            const moValues = newServiceForm.getFieldValue('mainOeuvres') || [];
            const prodValues = newServiceForm.getFieldValue('produits') || [];
            const totalMoTTC = moValues.reduce((total: number, item: { mainOeuvreId?: number; quantite?: number }) => {
                const prix = mainOeuvres.find((mo) => mo.id === item.mainOeuvreId)?.prixTTC || 0;
                return total + (prix * (item.quantite || 0));
            }, 0);
            const totalProdTTC = prodValues.reduce((total: number, item: { produitId?: number; quantite?: number }) => {
                const prix = produits.find((p) => p.id === item.produitId)?.prixVenteTTC || 0;
                return total + (prix * (item.quantite || 0));
            }, 0);
            const prixTTC = round2(totalMoTTC + totalProdTTC);
            const tva = newServiceForm.getFieldValue('tva') || 0;
            const montantTVA = round2((prixTTC / (100 + tva)) * tva);
            const prixHT = round2(prixTTC - montantTVA);
            newServiceForm.setFieldValue('prixTTC', prixTTC);
            newServiceForm.setFieldValue('montantTVA', montantTVA);
            newServiceForm.setFieldValue('prixHT', prixHT);
        }

        if (changedValues.prixHT !== undefined || changedValues.tva !== undefined) {
            const prixHT = newServiceForm.getFieldValue('prixHT') || 0;
            const tva = newServiceForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round(((prixHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
            newServiceForm.setFieldValue('montantTVA', montantTVA);
            newServiceForm.setFieldValue('prixTTC', Math.round(((prixHT + montantTVA) + Number.EPSILON) * 100) / 100);
        }
        if (changedValues.prixTTC !== undefined) {
            const prixTTC = newServiceForm.getFieldValue('prixTTC') || 0;
            const tva = newServiceForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round((((prixTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            newServiceForm.setFieldValue('montantTVA', montantTVA);
            newServiceForm.setFieldValue('prixHT', Math.round(((prixTTC - montantTVA) + Number.EPSILON) * 100) / 100);
        }
    };

    const openNewForfaitModal = (lineIndex: number) => {
        setNewForfaitTargetLine(lineIndex);
        newForfaitForm.resetFields();
        newForfaitForm.setFieldsValue(defaultNewForfait);
        setNewForfaitModalVisible(true);
    };

    const handleNewForfaitSave = async () => {
        try {
            const values = await newForfaitForm.validateFields();
            const res = await axios.post('/forfaits', values);
            const created = res.data as ForfaitEntity;
            message.success('Forfait ajouté avec succès');
            setForfaits((prev) => [...prev, created]);
            if (newForfaitTargetLine !== null && created.id) {
                const currentLines = form.getFieldValue('venteForfaits') || [];
                const updated = [...currentLines];
                updated[newForfaitTargetLine] = { ...updated[newForfaitTargetLine], forfaitId: created.id };
                form.setFieldValue('venteForfaits', updated);
                recalculateFromLines('auto');
            }
            setNewForfaitModalVisible(false);
        } catch {
            // validation errors shown in form
        }
    };

    const onNewForfaitValuesChange = (changedValues: Record<string, unknown>) => {
        if (changedValues.prixHT !== undefined || changedValues.tva !== undefined) {
            const prixHT = newForfaitForm.getFieldValue('prixHT') || 0;
            const tva = newForfaitForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round(((prixHT * (tva / 100)) + Number.EPSILON) * 100) / 100;
            newForfaitForm.setFieldValue('montantTVA', montantTVA);
            newForfaitForm.setFieldValue('prixTTC', Math.round(((prixHT + montantTVA) + Number.EPSILON) * 100) / 100);
        }
        if (changedValues.prixTTC !== undefined) {
            const prixTTC = newForfaitForm.getFieldValue('prixTTC') || 0;
            const tva = newForfaitForm.getFieldValue('tva') || 0;
            const montantTVA = Math.round((((prixTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            newForfaitForm.setFieldValue('montantTVA', montantTVA);
            newForfaitForm.setFieldValue('prixHT', Math.round(((prixTTC - montantTVA) + Number.EPSILON) * 100) / 100);
        }
    };

    const openNewClientModal = () => {
        newClientForm.resetFields();
        newClientForm.setFieldsValue({ nom: '', prenom: '', type: 'PARTICULIER', email: '', telephone: '', adresse: '', siren: '', siret: '', tva: '', naf: '', remise: 0, evaluation: 0, notes: '' });
        setNewClientModalVisible(true);
    };

    const handleNewClientSave = async () => {
        try {
            const values = await newClientForm.validateFields();
            const res = await axios.post('/clients', values);
            const created = res.data as ClientEntity;
            message.success('Client ajouté avec succès');
            setClients((prev) => [...prev, created]);
            form.setFieldValue('clientId', created.id);
            setNewClientModalVisible(false);
        } catch {
            // validation errors shown in form
        }
    };

    const openNewBateauModal = () => {
        newBateauForm.resetFields();
        newBateauForm.setFieldsValue({ name: '', immatriculation: '', numeroSerie: '', numeroClef: '', dateMeS: '', dateAchat: '', dateFinDeGuarantie: '', localisation: '' });
        setNewBateauModalVisible(true);
    };
    const handleNewBateauSave = async () => {
        try {
            const values = await newBateauForm.validateFields();
            const res = await axios.post('/bateaux', values);
            const created = res.data;
            message.success('Bateau ajouté avec succès');
            setBateaux((prev) => [...prev, created]);
            form.setFieldValue('bateauId', created.id);
            setNewBateauModalVisible(false);
        } catch { }
    };

    const openNewMoteurModal = () => {
        newMoteurForm.resetFields();
        newMoteurForm.setFieldsValue({ numeroSerie: '', numeroClef: '', dateMeS: '', dateAchat: '', dateFinDeGuarantie: '' });
        setNewMoteurModalVisible(true);
    };
    const handleNewMoteurSave = async () => {
        try {
            const values = await newMoteurForm.validateFields();
            const res = await axios.post('/moteurs', values);
            const created = res.data;
            message.success('Moteur ajouté avec succès');
            setMoteurs((prev) => [...prev, created]);
            form.setFieldValue('moteurId', created.id);
            setNewMoteurModalVisible(false);
        } catch { }
    };

    const openNewRemorqueModal = () => {
        newRemorqueForm.resetFields();
        newRemorqueForm.setFieldsValue({ immatriculation: '', dateMeS: '', dateAchat: '', dateFinDeGuarantie: '' });
        setNewRemorqueModalVisible(true);
    };
    const handleNewRemorqueSave = async () => {
        try {
            const values = await newRemorqueForm.validateFields();
            const res = await axios.post('/remorques', values);
            const created = res.data;
            message.success('Remorque ajoutée avec succès');
            setRemorques((prev) => [...prev, created]);
            form.setFieldValue('remorqueId', created.id);
            setNewRemorqueModalVisible(false);
        } catch { }
    };

    const populateForm = (vente: VenteEntity) => {
        const venteForfaitLines = (vente.venteForfaits || []).map(vf => ({
            forfaitId: vf.forfait?.id,
            quantite: vf.quantite || 1,
            technicienId: vf.technicien?.id,
            status: vf.status || 'EN_ATTENTE',
            datePlanification: vf.datePlanification,
            dateDebut: vf.dateDebut,
            dateFin: vf.dateFin,
            dureeReelle: vf.dureeReelle || 0,
            notes: vf.notes || '',
            incidentDate: toDateInputValue(vf.incidentDate),
            incidentDetails: vf.incidentDetails || '',
            taches: (vf.taches || []).map(t => ({ nom: t.nom || '', description: t.description || '', done: t.done || false })),
        }));
        const venteServiceLines = (vente.venteServices || []).map(vs => ({
            serviceId: vs.service?.id,
            quantite: vs.quantite || 1,
            technicienId: vs.technicien?.id,
            status: vs.status || 'EN_ATTENTE',
            datePlanification: vs.datePlanification,
            dateDebut: vs.dateDebut,
            dateFin: vs.dateFin,
            dureeReelle: vs.dureeReelle || 0,
            notes: vs.notes || '',
            incidentDate: toDateInputValue(vs.incidentDate),
            incidentDetails: vs.incidentDetails || '',
            taches: (vs.taches || []).map(t => ({ nom: t.nom || '', description: t.description || '', done: t.done || false })),
        }));
        const produitLinesMap = (vente.produits || []).reduce((acc, item) => {
            if (!item?.id) {
                return acc;
            }
            acc.set(item.id, (acc.get(item.id) || 0) + 1);
            return acc;
        }, new Map<number, number>());
        const produitLines = Array.from(produitLinesMap.entries()).map(([produitId, quantite]) => ({ produitId, quantite }));
        form.resetFields();
        form.setFieldsValue({
            status: vente.status || 'EN_ATTENTE',
            type: vente.type || 'DEVIS',
            clientId: vente.client?.id,
            bateauId: vente.bateau?.id,
            moteurId: vente.moteur?.id,
            remorqueId: vente.remorque?.id,
            venteForfaits: [...venteForfaitLines, { status: 'EN_ATTENTE' }],
            venteServices: [...venteServiceLines, { status: 'EN_ATTENTE' }],
            produits: [...produitLines, {}],
            date: toDateInputValue(vente.date) || getTodayIsoDate(),
            montantHT: vente.montantHT || 0,
            remise: vente.remise || 0,
            remisePourcentage: vente.montantTTC ? Math.round((((vente.remise || 0) / vente.montantTTC) * 100 + Number.EPSILON) * 100) / 100 : 0,
            tva: vente.tva || 0,
            montantTVA: vente.montantTVA || 0,
            montantTTC: vente.montantTTC || 0,
            prixVenteTTC: vente.prixVenteTTC || 0,
            modePaiement: vente.modePaiement,
            rappel1Jours: vente.rappel1Jours,
            rappel2Jours: vente.rappel2Jours,
            rappel3Jours: vente.rappel3Jours
        });
    };

    const openModal = async (vente?: VenteEntity) => {
        if (vente) {
            setIsEdit(true);
            setCurrentVente(vente);
            setModalVisible(true);
            if (vente.id) {
                axios.get<RappelHistoriqueEntity[]>(`/rappels/vente/${vente.id}`).then(res => setRappelHistorique(res.data)).catch(() => setRappelHistorique([]));
                // Fetch the full vente to ensure all nested data is loaded
                try {
                    const res = await axios.get<VenteEntity>(`/ventes/${vente.id}`);
                    const fullVente = res.data;
                    setCurrentVente(fullVente);
                    populateForm(fullVente);
                } catch {
                    populateForm(vente);
                }
            } else {
                populateForm(vente);
            }
        } else {
            setIsEdit(false);
            setCurrentVente(null);
            setRappelHistorique([]);
            form.resetFields();
            form.setFieldsValue({ ...defaultVente, date: getTodayIsoDate() });
            setModalVisible(true);
        }
    };

    const toPayload = (values: VenteFormValues): VenteEntity => ({
        status: values.status,
        type: values.type,
        client: clients.find((client) => client.id === values.clientId),
        bateau: bateaux.find((bateau) => bateau.id === values.bateauId),
        moteur: moteurs.find((moteur) => moteur.id === values.moteurId),
        remorque: remorques.find((remorque) => remorque.id === values.remorqueId),
        venteForfaits: (values.venteForfaits || [])
            .filter((line) => line.forfaitId)
            .map((line) => {
                const selectedForfait = forfaits.find((f) => f.id === line.forfaitId);
                // Use existing taches if available, otherwise copy from catalogue forfait template
                const existingTaches = (line.taches || []).filter((t: { nom?: string }) => t.nom?.trim());
                const taches = existingTaches.length > 0
                    ? existingTaches.map((t: { nom?: string; description?: string; done?: boolean }) => ({ nom: t.nom, description: t.description, done: t.done || false }))
                    : (selectedForfait?.taches || []).filter((t) => t.nom?.trim()).map((t) => ({ nom: t.nom, description: t.description || '', done: false }));
                // Preserve existing vente data (dates, etc.) from currentVente if available
                const existingVf = (currentVente?.venteForfaits || []).find((vf) => vf.forfait?.id === line.forfaitId);
                return {
                    forfait: selectedForfait,
                    quantite: line.quantite || 1,
                    technicien: techniciens.find((t) => t.id === line.technicienId),
                    datePlanification: line.datePlanification || existingVf?.datePlanification,
                    dateDebut: line.dateDebut || existingVf?.dateDebut,
                    dateFin: line.dateFin || existingVf?.dateFin,
                    status: line.status || 'EN_ATTENTE',
                    dureeReelle: line.dureeReelle || existingVf?.dureeReelle || 0,
                    notes: line.notes || '',
                    incidentDate: line.incidentDate,
                    incidentDetails: line.incidentDetails || '',
                    taches,
                };
            }),
        venteServices: (values.venteServices || [])
            .filter((line) => line.serviceId)
            .map((line) => {
                // Preserve existing taches from currentVente
                const existingVs = (currentVente?.venteServices || []).find((vs) => vs.service?.id === line.serviceId);
                const existingTaches = (line.taches || []).filter((t: { nom?: string }) => t.nom?.trim());
                const taches = existingTaches.length > 0
                    ? existingTaches.map((t: { nom?: string; description?: string; done?: boolean }) => ({ nom: t.nom, description: t.description, done: t.done || false }))
                    : (existingVs?.taches || []).map((t) => ({ nom: t.nom, description: t.description || '', done: t.done || false }));
                return {
                    service: services.find((s) => s.id === line.serviceId),
                    quantite: line.quantite || 1,
                    technicien: techniciens.find((t) => t.id === line.technicienId),
                    datePlanification: line.datePlanification || existingVs?.datePlanification,
                    dateDebut: line.dateDebut || existingVs?.dateDebut,
                    dateFin: line.dateFin || existingVs?.dateFin,
                    status: line.status || 'EN_ATTENTE',
                    dureeReelle: line.dureeReelle || existingVs?.dureeReelle || 0,
                    notes: line.notes || '',
                    incidentDate: line.incidentDate,
                    incidentDetails: line.incidentDetails || '',
                    taches,
                };
            }),
        produits: (values.produits || [])
            .filter((line) => line.produitId)
            .flatMap((line) => {
                const item = produits.find((produit) => produit.id === line.produitId);
                const safeQuantity = Math.max(1, Math.floor(line.quantite || 1));
                return item ? Array.from({ length: safeQuantity }, () => item) : [];
            }) as ProduitCatalogueEntity[],
        date: toBackendDateValue(values.date),
        montantHT: values.montantHT || 0,
        remise: values.remise || 0,
        tva: values.tva || 0,
        montantTVA: values.montantTVA || 0,
        montantTTC: values.montantTTC || 0,
        prixVenteTTC: values.prixVenteTTC || 0,
        modePaiement: values.modePaiement,
        rappel1Jours: values.rappel1Jours,
        rappel2Jours: values.rappel2Jours,
        rappel3Jours: values.rappel3Jours
    });

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const payload = toPayload(values);
            if (isEdit && currentVente?.id) {
                const res = await axios.put(`/ventes/${currentVente.id}`, { ...currentVente, ...payload });
                message.success('Vente modifiee avec succes');
                setCurrentVente(res.data);
                form.setFieldsValue(values);
            } else {
                const res = await axios.post('/ventes', payload);
                message.success('Vente ajoutee avec succes');
                setIsEdit(true);
                setCurrentVente(res.data);
                form.setFieldsValue(values);
            }
            fetchVentes(filters);
        } catch {
            // Les erreurs de validation sont affichees par le formulaire.
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) {
            return;
        }
        try {
            await axios.delete(`/ventes/${id}`);
            message.success('Vente supprimee avec succes');
            fetchVentes(filters);
        } catch {
            message.error('Erreur lors de la suppression de la vente.');
        }
    };

    const openPrintDocument = (_title: string, contentHtml: string, _width: number = 900) => {
        // Print through a hidden iframe to avoid opening a new tab/window.
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const cleanup = () => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        };

        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) {
            cleanup();
            message.error("Impossible de lancer l'impression.");
            return;
        }

        iframeWindow.document.open();
        iframeWindow.document.write(contentHtml);
        iframeWindow.document.close();
        iframeWindow.focus();
        iframeWindow.print();

        setTimeout(cleanup, 1000);
    };

    const handlePrint = (vente: VenteEntity) => {
        const title = `Vente #${vente.id || '-'}`;
        const forfaitLines = (vente.venteForfaits || []).map(vf => ({
            type: 'Forfait',
            label: vf.forfait?.nom || '',
            quantite: vf.quantite || 1,
            totalPrixTTC: (vf.forfait?.prixTTC || 0) * (vf.quantite || 1)
        }));
        const produitLines = Array.from(
            (vente.produits || []).reduce((acc, item) => {
                const label = `${item.nom}${item.marque ? ` (${item.marque})` : ''}`;
                const key = item.id ? `id-${item.id}` : `label-${label}`;
                const current = acc.get(key) || { type: 'Produit', label, quantite: 0, totalPrixTTC: 0 };
                current.quantite += 1;
                current.totalPrixTTC += item.prixVenteTTC || 0;
                acc.set(key, current);
                return acc;
            }, new Map<string, { type: string; label: string; quantite: number; totalPrixTTC: number }>())
                .values()
        );
        const serviceLines = (vente.venteServices || []).map(vs => ({
            type: 'Service',
            label: vs.service?.nom || '',
            quantite: vs.quantite || 1,
            totalPrixTTC: (vs.service?.prixTTC || 0) * (vs.quantite || 1)
        }));
        const invoiceLines = [...forfaitLines, ...produitLines, ...serviceLines];
        const invoiceRowsHtml = invoiceLines.length > 0
            ? `
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Designation</th>
                            <th>Qte</th>
                            <th>Prix total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoiceLines
                            .map((line) => `
                                <tr>
                                    <td>${escapeHtml(line.type)}</td>
                                    <td>${escapeHtml(line.label)}</td>
                                    <td>${line.quantite}</td>
                                    <td>${escapeHtml(formatEuro(line.totalPrixTTC))}</td>
                                </tr>
                            `)
                            .join('')}
                    </tbody>
                </table>
            `
            : '<p>Aucun element</p>';

        openPrintDocument(
            title,
            `
            <html>
            <head>
                <title>${escapeHtml(title)}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 24px; color: #1f1f1f; }
                    h1 { margin-bottom: 8px; }
                    .meta { margin-bottom: 20px; color: #595959; }
                    .row { margin-bottom: 8px; }
                    .section { margin-top: 20px; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                    .invoice-table th, .invoice-table td { border: 1px solid #d9d9d9; padding: 6px 8px; }
                    .invoice-table th { background: #fafafa; text-align: left; }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(title)}</h1>
                <div class="meta">Date: ${escapeHtml(formatDate(vente.date))}</div>
                <div class="row"><strong>Type:</strong> ${escapeHtml(vente.type || '-')}</div>
                <div class="row"><strong>Statut:</strong> ${escapeHtml(vente.status || '-')}</div>
                <div class="row"><strong>Client:</strong> ${escapeHtml(getClientLabel(vente.client))}</div>
                <div class="row"><strong>Montant TTC:</strong> ${escapeHtml(formatEuro(vente.montantTTC))}</div>
                <div class="row"><strong>Remise:</strong> ${escapeHtml(formatEuro(vente.remise))}</div>
                <div class="row"><strong>Prix vente TTC:</strong> ${escapeHtml(formatEuro(vente.prixVenteTTC))}</div>
                <div class="row"><strong>Mode de paiement:</strong> ${escapeHtml(vente.modePaiement || '-')}</div>

                <div class="section">
                    <h3>Lignes</h3>
                    ${invoiceRowsHtml}
                </div>
            </body>
            </html>
        `
        );
    };

    const handleEmail = (vente: VenteEntity) => {
        const selectedClientId = form.getFieldValue('clientId');
        const fallbackClient = clients.find((client) => client.id === vente.client?.id || client.id === selectedClientId);
        const email = vente.client?.email || fallbackClient?.email || '';
        if (!email) {
            message.warning("Aucun email client n'est renseigne pour cette vente.");
            return;
        }

        const forfaitLines = (vente.venteForfaits || []).map(vf => ({
            type: 'Forfait',
            label: vf.forfait?.nom || '',
            quantite: vf.quantite || 1,
            totalPrixTTC: (vf.forfait?.prixTTC || 0) * (vf.quantite || 1)
        }));
        const produitLines = Array.from(
            (vente.produits || []).reduce((acc, item) => {
                const label = `${item.nom}${item.marque ? ` (${item.marque})` : ''}`;
                const key = item.id ? `id-${item.id}` : `label-${label}`;
                const current = acc.get(key) || { type: 'Produit', label, quantite: 0, totalPrixTTC: 0 };
                current.quantite += 1;
                current.totalPrixTTC += item.prixVenteTTC || 0;
                acc.set(key, current);
                return acc;
            }, new Map<string, { type: string; label: string; quantite: number; totalPrixTTC: number }>())
                .values()
        );
        const serviceLines = (vente.venteServices || []).map(vs => ({
            type: 'Service',
            label: vs.service?.nom || '',
            quantite: vs.quantite || 1,
            totalPrixTTC: (vs.service?.prixTTC || 0) * (vs.quantite || 1)
        }));
        const invoiceLines = [...forfaitLines, ...produitLines, ...serviceLines];
        const formatColumn = (value: string, width: number, align: 'left' | 'right' = 'left') => {
            const truncated = value.length > width ? `${value.slice(0, width - 1)}.` : value;
            return align === 'right' ? truncated.padStart(width) : truncated.padEnd(width);
        };
        const typeWidth = 8;
        const designationWidth = 38;
        const qtyWidth = 5;
        const priceWidth = 13;
        const rowSeparator = '-'.repeat(typeWidth + designationWidth + qtyWidth + priceWidth + 9);
        const invoiceTableLines = invoiceLines.length > 0
            ? [
                `${formatColumn('Type', typeWidth)} | ${formatColumn('Designation', designationWidth)} | ${formatColumn('Qte', qtyWidth, 'right')} | ${formatColumn('Prix total', priceWidth, 'right')}`,
                rowSeparator,
                ...invoiceLines.map((line) =>
                    `${formatColumn(line.type, typeWidth)} | ${formatColumn(line.label, designationWidth)} | ${formatColumn(String(line.quantite), qtyWidth, 'right')} | ${formatColumn(formatEuro(line.totalPrixTTC), priceWidth, 'right')}`
                )
            ]
            : ['Aucun element'];

        const subject = encodeURIComponent(`Vente #${vente.id || '-'}`);
        const body = encodeURIComponent(
            [
                `Bonjour ${getClientLabel(vente.client || fallbackClient)},`,
                '',
                `Veuillez trouver les informations de votre vente #${vente.id || '-'}.`,
                '',
                `Date             : ${formatDate(vente.date)}`,
                `Type             : ${vente.type || '-'}`,
                `Statut           : ${vente.status || '-'}`,
                `Prix vente TTC   : ${formatEuro(vente.prixVenteTTC)}`,
                `Mode de paiement : ${vente.modePaiement || '-'}`,
                '',
                'Lignes:',
                ...invoiceTableLines,
                '',
                'Cordialement,'
            ].join('\n')
        );

        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    };

    const handlePayment = async (vente: VenteEntity, provider: 'stripe' | 'payplug') => {
        if (!vente.id) {
            message.warning('La vente doit etre enregistree avant de generer un lien de paiement.');
            return;
        }
        try {
            const res = await axios.post(`/ventes/${vente.id}/payment-link/${provider}`);
            window.open(res.data.url, '_blank', 'noopener,noreferrer');
        } catch {
            message.error(`Erreur lors de la creation du lien de paiement ${provider === 'stripe' ? 'Stripe' : 'PayPlug'}`);
        }
    };

    const paymentMenuItems = (vente: VenteEntity) => ([
        { key: 'stripe', label: 'Payer via Stripe', onClick: () => handlePayment(vente, 'stripe') },
        { key: 'payplug', label: 'Payer via PayPlug', onClick: () => handlePayment(vente, 'payplug') },
    ]);

    const recalculateFromLines = (remiseSource: 'amount' | 'percentage' | 'auto' = 'auto') => {
        const venteForfaitLines = form.getFieldValue('venteForfaits') || [];
        const produitLines = form.getFieldValue('produits') || [];
        const venteServiceLines = form.getFieldValue('venteServices') || [];
        let remise = form.getFieldValue('remise') || 0;
        let remisePourcentage = form.getFieldValue('remisePourcentage') || 0;
        const tva = form.getFieldValue('tva') || 0;

        const forfaitsTTC = venteForfaitLines.reduce((sum: number, line: { forfaitId?: number; quantite?: number }) => {
            const prixUnitaire = forfaits.find((item) => item.id === line.forfaitId)?.prixTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);
        const produitsTTC = produitLines.reduce((sum: number, line: { produitId?: number; quantite?: number }) => {
            const prixUnitaire = produits.find((item) => item.id === line.produitId)?.prixVenteTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);
        const servicesTTC = venteServiceLines.reduce((sum: number, line: { serviceId?: number; quantite?: number }) => {
            const prixUnitaire = services.find((item) => item.id === line.serviceId)?.prixTTC || 0;
            const quantite = Math.max(1, Math.floor(line.quantite || 1));
            return sum + (prixUnitaire * quantite);
        }, 0);

        const montantTTC = Math.round(((forfaitsTTC + produitsTTC + servicesTTC) + Number.EPSILON) * 100) / 100;
        const montantTVA = Math.round((((montantTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
        const montantHT = Math.round(((montantTTC - montantTVA) + Number.EPSILON) * 100) / 100;

        if (remiseSource === 'percentage') {
            remise = Math.round((((montantTTC * remisePourcentage) / 100) + Number.EPSILON) * 100) / 100;
        } else {
            remisePourcentage = montantTTC > 0
                ? Math.round((((remise / montantTTC) * 100) + Number.EPSILON) * 100) / 100
                : 0;
        }

        const prixVenteTTC = Math.round(((montantTTC - remise) + Number.EPSILON) * 100) / 100;

        form.setFieldValue('montantHT', montantHT);
        form.setFieldValue('montantTVA', montantTVA);
        form.setFieldValue('montantTTC', montantTTC);
        form.setFieldValue('remise', remise);
        form.setFieldValue('remisePourcentage', remisePourcentage);
        form.setFieldValue('prixVenteTTC', prixVenteTTC);
    };

    const onValuesChange = (changedValues: Partial<VenteFormValues>, allValues: VenteFormValues) => {
        if (changedValues.venteForfaits !== undefined) {
            const currentForfaitLines = allValues.venteForfaits || [];
            if (currentForfaitLines.length === 0) {
                form.setFieldValue('venteForfaits', [{ status: 'EN_ATTENTE' }]);
            } else {
                const lastForfaitLine = currentForfaitLines[currentForfaitLines.length - 1];
                const isLastLineComplete = !!lastForfaitLine?.forfaitId && (lastForfaitLine?.quantite || 0) > 0;
                if (isLastLineComplete) {
                    form.setFieldValue('venteForfaits', [...currentForfaitLines, { status: 'EN_ATTENTE' }]);
                }
            }
        }

        if (changedValues.produits !== undefined) {
            const currentProduitLines = allValues.produits || [];
            if (currentProduitLines.length === 0) {
                form.setFieldValue('produits', [{}]);
            } else {
                const lastProduitLine = currentProduitLines[currentProduitLines.length - 1];
                const isLastLineComplete = !!lastProduitLine?.produitId && (lastProduitLine?.quantite || 0) > 0;
                if (isLastLineComplete) {
                    form.setFieldValue('produits', [...currentProduitLines, {}]);
                }
            }
        }

        if (changedValues.venteServices !== undefined) {
            const currentServiceLines = allValues.venteServices || [];
            if (currentServiceLines.length === 0) {
                form.setFieldValue('venteServices', [{ status: 'EN_ATTENTE' }]);
            } else {
                const lastServiceLine = currentServiceLines[currentServiceLines.length - 1];
                const isLastLineComplete = !!lastServiceLine?.serviceId && (lastServiceLine?.quantite || 0) > 0;
                if (isLastLineComplete) {
                    form.setFieldValue('venteServices', [...currentServiceLines, { status: 'EN_ATTENTE' }]);
                }
            }
        }

        if (changedValues.montantTTC !== undefined) {
            const tva = allValues.tva || 0;
            const montantTTC = changedValues.montantTTC || 0;
            const montantTVA = Math.round((((montantTTC / (100 + tva)) * tva) + Number.EPSILON) * 100) / 100;
            const montantHT = Math.round(((montantTTC - montantTVA) + Number.EPSILON) * 100) / 100;
            const remise = allValues.remise || 0;
            const remisePourcentage = montantTTC > 0
                ? Math.round((((remise / montantTTC) * 100) + Number.EPSILON) * 100) / 100
                : 0;
            const prixVenteTTC = Math.round(((montantTTC - remise) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('montantHT', montantHT);
            form.setFieldValue('montantTVA', montantTVA);
            form.setFieldValue('remisePourcentage', remisePourcentage);
            form.setFieldValue('prixVenteTTC', prixVenteTTC);
            return;
        }

        if (changedValues.montantHT !== undefined) {
            const tva = allValues.tva || 0;
            const montantHT = changedValues.montantHT || 0;
            const montantTVA = Math.round(((montantHT * tva / 100) + Number.EPSILON) * 100) / 100;
            const montantTTC = Math.round(((montantHT + montantTVA) + Number.EPSILON) * 100) / 100;
            const remise = allValues.remise || 0;
            const remisePourcentage = montantTTC > 0
                ? Math.round((((remise / montantTTC) * 100) + Number.EPSILON) * 100) / 100
                : 0;
            const prixVenteTTC = Math.round(((montantTTC - remise) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('montantTTC', montantTTC);
            form.setFieldValue('montantTVA', montantTVA);
            form.setFieldValue('remisePourcentage', remisePourcentage);
            form.setFieldValue('prixVenteTTC', prixVenteTTC);
            return;
        }

        if (changedValues.montantTVA !== undefined) {
            const montantTTC = allValues.montantTTC || 0;
            const montantTVA = changedValues.montantTVA || 0;
            const montantHT = Math.round(((montantTTC - montantTVA) + Number.EPSILON) * 100) / 100;
            const prixVenteTTC = Math.round(((montantTTC - (allValues.remise || 0)) + Number.EPSILON) * 100) / 100;
            form.setFieldValue('montantHT', montantHT);
            form.setFieldValue('prixVenteTTC', prixVenteTTC);
            return;
        }

        if (changedValues.prixVenteTTC !== undefined) {
            const montantTTC = allValues.montantTTC || 0;
            const prixVenteTTC = changedValues.prixVenteTTC || 0;
            const remise = Math.round(((montantTTC - prixVenteTTC) + Number.EPSILON) * 100) / 100;
            const remisePourcentage = montantTTC > 0
                ? Math.round((((remise / montantTTC) * 100) + Number.EPSILON) * 100) / 100
                : 0;
            form.setFieldValue('remise', remise);
            form.setFieldValue('remisePourcentage', remisePourcentage);
            return;
        }

        if (
            changedValues.venteForfaits !== undefined ||
            changedValues.produits !== undefined ||
            changedValues.venteServices !== undefined ||
            changedValues.tva !== undefined ||
            changedValues.remisePourcentage !== undefined ||
            changedValues.remise !== undefined
        ) {
            if (changedValues.remisePourcentage !== undefined) {
                recalculateFromLines('percentage');
                return;
            }
            if (changedValues.remise !== undefined) {
                recalculateFromLines('amount');
                return;
            }
            recalculateFromLines('auto');
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (value: string) => value || '-'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (value: VenteType) => typeOptions.find((item) => item.value === value)?.label || value
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            render: (value: VenteStatus) => {
                const label = statusOptions.find((item) => item.value === value)?.label || value;
                return <Tag color={statusColor[value] || 'default'}>{label}</Tag>;
            }
        },
        {
            title: 'Client',
            dataIndex: 'client',
            render: (value: ClientEntity) => getClientLabel(value)
        },
        {
            title: 'Forfaits',
            dataIndex: 'venteForfaits',
            render: (values: VenteForfaitEntity[]) => values?.length || 0
        },
        {
            title: 'Services',
            dataIndex: 'venteServices',
            render: (values: VenteServiceEntity[]) => values?.length || 0
        },
        {
            title: 'Produits',
            dataIndex: 'produits',
            render: (values: ProduitCatalogueEntity[]) => values?.length || 0
        },
        {
            title: 'Mode paiement',
            dataIndex: 'modePaiement',
            render: (value: ModePaiement) => modePaiementOptions.find((item) => item.value === value)?.label || value || '-'
        },
        {
            title: 'Prix vente TTC',
            dataIndex: 'prixVenteTTC',
            sorter: (a: VenteEntity, b: VenteEntity) => (a.prixVenteTTC || 0) - (b.prixVenteTTC || 0),
            render: (value: number) => formatEuro(value)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: VenteEntity) => (
                <Space>
                    <Button title="Imprimer" icon={<PrinterOutlined />} onClick={() => handlePrint(record)} />
                    <Button title="Envoyer par email" icon={<MailOutlined />} onClick={() => handleEmail(record)} />
                    <Dropdown menu={{ items: paymentMenuItems(record) }} placement="bottomRight">
                        <Button title="Lien de paiement" icon={<CreditCardOutlined />} />
                    </Dropdown>
                    <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm
                        title="Supprimer cette vente ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card title="Prestations">
            <Form
                form={searchForm}
                layout="vertical"
                initialValues={{ status: undefined, type: undefined, clientId: undefined }}
                onFinish={(values) => {
                    const nextFilters: SearchFilters = {
                        status: values.status,
                        type: values.type,
                        clientId: values.clientId
                    };
                    setFilters(nextFilters);
                    fetchVentes(nextFilters);
                }}
            >
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="status" label="Statut">
                            <Select allowClear options={statusOptions} placeholder="Tous les statuts" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="type" label="Type">
                            <Select allowClear options={typeOptions} placeholder="Tous les types" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="clientId" label="Client">
                            <Select allowClear showSearch options={clientOptions} placeholder="Tous les clients" />
                        </Form.Item>
                    </Col>
                    <Col span={4} style={{ display: 'flex', alignItems: 'end' }}>
                        <Space>
                            <Button type="primary" htmlType="submit">Rechercher</Button>
                            <Button
                                onClick={() => {
                                    searchForm.resetFields();
                                    setFilters({});
                                    fetchVentes();
                                }}
                            >
                                Reinitialiser
                            </Button>
                            <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => openModal()} />
                        </Space>
                    </Col>
                </Row>
            </Form>

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col span={24}>
                    <Table
                        rowKey="id"
                        dataSource={ventes}
                        columns={columns}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />
                </Col>
            </Row>

            <Modal
                title={isEdit ? 'Modifier une vente' : 'Ajouter une vente'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button
                        key="print"
                        icon={<PrinterOutlined />}
                        disabled={!currentVente}
                        onClick={() => currentVente && handlePrint(currentVente)}
                    >
                        Imprimer
                    </Button>,
                    <Button
                        key="email"
                        icon={<MailOutlined />}
                        disabled={!currentVente}
                        onClick={() => currentVente && handleEmail(currentVente)}
                    >
                        Envoyer par email
                    </Button>,
                    <Dropdown
                        key="payment"
                        menu={{ items: currentVente ? paymentMenuItems(currentVente) : [] }}
                        placement="topRight"
                        disabled={!currentVente}
                    >
                        <Button icon={<CreditCardOutlined />}>
                            Lien de paiement
                        </Button>
                    </Dropdown>,
                    <Button key="cancel" onClick={() => setModalVisible(false)}>
                        Annuler
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        Enregistrer
                    </Button>
                ]}
                maskClosable={false}
                destroyOnHidden
                width={1400}
            >
                <Form form={form} layout="vertical" initialValues={defaultVente} onValuesChange={onValuesChange}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[{ required: true, message: 'Le type est requis' }]}
                            >
                                <Select options={typeOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="status"
                                label="Statut"
                                rules={[{ required: true, message: 'Le statut est requis' }]}
                            >
                                <Select options={statusOptions} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="date" label="Date">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="modePaiement" label="Mode de paiement">
                                <Select allowClear options={modePaiementOptions} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Client">
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item name="clientId" noStyle>
                                        <Select allowClear showSearch options={clientOptions} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Button icon={<PlusOutlined />} title="Créer un client" onClick={openNewClientModal} />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Bateau">
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item name="bateauId" noStyle>
                                        <Select allowClear showSearch options={bateauOptions} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Button icon={<PlusOutlined />} title="Créer un bateau" onClick={openNewBateauModal} />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Moteur">
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item name="moteurId" noStyle>
                                        <Select allowClear showSearch options={moteurOptions} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Button icon={<PlusOutlined />} title="Créer un moteur" onClick={openNewMoteurModal} />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Remorque">
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item name="remorqueId" noStyle>
                                        <Select allowClear showSearch options={remorqueOptions} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Button icon={<PlusOutlined />} title="Créer une remorque" onClick={openNewRemorqueModal} />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Tabs
                        defaultActiveKey="lignes"
                        items={[
                            {
                                key: 'lignes',
                                label: 'Lignes',
                                children: (
                                    <>
                                        <Form.Item label="Forfaits">
                                            <Form.List name="venteForfaits">
                                                {(fields, { remove }) => (
                                                    <>
                                                        {fields.map((field) => {
                                                            const forfaitId = form.getFieldValue(['venteForfaits', field.name, 'forfaitId']);
                                                            const isEmptyLine = !forfaitId;
                                                            return (
                                                            <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8, flexWrap: 'nowrap' }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'forfaitId']}
                                                                    rules={[
                                                                        {
                                                                            validator: async (_, value) => {
                                                                                const line = form.getFieldValue(['venteForfaits', field.name]);
                                                                                const quantite = Number(line?.quantite || 0);
                                                                                if (!value && quantite > 0) {
                                                                                    throw new Error('Forfait requis');
                                                                                }
                                                                            }
                                                                        }
                                                                    ]}
                                                                    style={{ width: 280 }}
                                                                >
                                                                    <Select
                                                                        allowClear
                                                                        showSearch
                                                                        options={forfaitOptions}
                                                                        placeholder="Forfait"
                                                                        filterOption={(input, option) =>
                                                                            (((option as { searchText?: string } | undefined)?.searchText) || '').includes(input.toLowerCase())
                                                                        }
                                                                    />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'quantite']}
                                                                    rules={[
                                                                        {
                                                                            validator: async (_, value) => {
                                                                                const line = form.getFieldValue(['venteForfaits', field.name]);
                                                                                if (!line?.forfaitId && (value === undefined || value === null)) {
                                                                                    return;
                                                                                }
                                                                                if (!value || value <= 0) {
                                                                                    throw new Error('Quantite requise');
                                                                                }
                                                                            }
                                                                        }
                                                                    ]}
                                                                    style={{ width: 80 }}
                                                                >
                                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const fId = getFieldValue(['venteForfaits', field.name, 'forfaitId']);
                                                                        const pu = forfaits.find((f) => f.id === fId)?.prixTTC;
                                                                        return (
                                                                            <Form.Item style={{ width: 120 }}>
                                                                                <InputNumber addonAfter="EUR" value={pu ?? undefined} style={{ width: '100%' }} disabled placeholder="P.U." />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const fId = getFieldValue(['venteForfaits', field.name, 'forfaitId']);
                                                                        const quantite = getFieldValue(['venteForfaits', field.name, 'quantite']) || 0;
                                                                        const pu = forfaits.find((f) => f.id === fId)?.prixTTC || 0;
                                                                        const total = Math.round(((pu * quantite) + Number.EPSILON) * 100) / 100;
                                                                        return (
                                                                            <Form.Item style={{ width: 120 }}>
                                                                                <InputNumber addonAfter="EUR" value={total} style={{ width: '100%' }} disabled />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'status']}
                                                                    style={{ width: 130 }}
                                                                >
                                                                    <Select allowClear options={planningStatusOptions} placeholder="Status" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'technicienId']}
                                                                    style={{ width: 180 }}
                                                                >
                                                                    <Select allowClear showSearch options={technicienOptions} placeholder="Technicien" />
                                                                </Form.Item>
                                                                {isEmptyLine ? (
                                                                    <Button icon={<PlusOutlined />} title="Créer un forfait" onClick={() => openNewForfaitModal(field.name)} />
                                                                ) : (
                                                                    <Button icon={<CalendarOutlined />} title="Planifier" onClick={() => { setModalVisible(false); history.push('/planning'); }} />
                                                                )}
                                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                                            </Space>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>

                                        <Form.Item label="Services">
                                            <Form.List name="venteServices">
                                                {(fields, { remove }) => (
                                                    <>
                                                        {fields.map((field) => {
                                                            const serviceId = form.getFieldValue(['venteServices', field.name, 'serviceId']);
                                                            const isEmptyLine = !serviceId;
                                                            return (
                                                            <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8, flexWrap: 'nowrap' }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'serviceId']}
                                                                    hidden
                                                                >
                                                                    <InputNumber />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    style={{ width: 280 }}
                                                                >
                                                                    <Input disabled value={services.find((s) => s.id === serviceId)?.nom || ''} placeholder="Service" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'quantite']}
                                                                    rules={[
                                                                        {
                                                                            validator: async (_, value) => {
                                                                                const line = form.getFieldValue(['venteServices', field.name]);
                                                                                if (!line?.serviceId && (value === undefined || value === null)) {
                                                                                    return;
                                                                                }
                                                                                if (!value || value <= 0) {
                                                                                    throw new Error('Quantite requise');
                                                                                }
                                                                            }
                                                                        }
                                                                    ]}
                                                                    style={{ width: 80 }}
                                                                >
                                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const sId = getFieldValue(['venteServices', field.name, 'serviceId']);
                                                                        const pu = services.find((s) => s.id === sId)?.prixTTC;
                                                                        return (
                                                                            <Form.Item style={{ width: 120 }}>
                                                                                <InputNumber addonAfter="EUR" value={pu ?? undefined} style={{ width: '100%' }} disabled placeholder="P.U." />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const sId = getFieldValue(['venteServices', field.name, 'serviceId']);
                                                                        const quantite = getFieldValue(['venteServices', field.name, 'quantite']) || 0;
                                                                        const pu = services.find((s) => s.id === sId)?.prixTTC || 0;
                                                                        const total = Math.round(((pu * quantite) + Number.EPSILON) * 100) / 100;
                                                                        return (
                                                                            <Form.Item style={{ width: 120 }}>
                                                                                <InputNumber addonAfter="EUR" value={total} style={{ width: '100%' }} disabled />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'status']}
                                                                    style={{ width: 130 }}
                                                                >
                                                                    <Select allowClear options={planningStatusOptions} placeholder="Status" />
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'technicienId']}
                                                                    style={{ width: 180 }}
                                                                >
                                                                    <Select allowClear showSearch options={technicienOptions} placeholder="Technicien" />
                                                                </Form.Item>
                                                                {isEmptyLine ? (
                                                                    <Button icon={<PlusOutlined />} title="Créer un service" onClick={() => openNewServiceModal(field.name)} />
                                                                ) : (
                                                                    <>
                                                                        <Button icon={<EditOutlined />} title="Modifier le service" onClick={() => openEditServiceModal(serviceId)} />
                                                                        <Button icon={<CalendarOutlined />} title="Planifier" onClick={() => { setModalVisible(false); history.push('/planning'); }} />
                                                                    </>
                                                                )}
                                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                                            </Space>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>

                                        <Form.Item label="Produits">
                                            <Form.List name="produits">
                                                {(fields, { remove }) => (
                                                    <>
                                                        {fields.map((field) => {
                                                            const produitId = form.getFieldValue(['produits', field.name, 'produitId']);
                                                            const isEmptyLine = !produitId;
                                                            return (
                                                            <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'produitId']}
                                                                    rules={[
                                                                        {
                                                                            validator: async (_, value) => {
                                                                                const line = form.getFieldValue(['produits', field.name]);
                                                                                const quantite = Number(line?.quantite || 0);
                                                                                if (!value && quantite > 0) {
                                                                                    throw new Error('Produit requis');
                                                                                }
                                                                            }
                                                                        }
                                                                    ]}
                                                                    style={{ width: 520 }}
                                                                >
                                                                    <Select allowClear showSearch options={produitOptions} placeholder="Produit" />
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const pid = getFieldValue(['produits', field.name, 'produitId']);
                                                                        const pu = produits.find((item) => item.id === pid)?.prixVenteTTC;
                                                                        return (
                                                                            <Form.Item style={{ width: 150 }}>
                                                                                <InputNumber addonAfter="EUR" value={pu ?? undefined} style={{ width: '100%' }} disabled placeholder="P.U." />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'quantite']}
                                                                    rules={[
                                                                        {
                                                                            validator: async (_, value) => {
                                                                                const line = form.getFieldValue(['produits', field.name]);
                                                                                if (!line?.produitId && (value === undefined || value === null)) {
                                                                                    return;
                                                                                }
                                                                                if (!value || value <= 0) {
                                                                                    throw new Error('Quantite requise');
                                                                                }
                                                                            }
                                                                        }
                                                                    ]}
                                                                    style={{ width: 120 }}
                                                                >
                                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Qte" />
                                                                </Form.Item>
                                                                <Form.Item noStyle shouldUpdate>
                                                                    {({ getFieldValue }) => {
                                                                        const pid = getFieldValue(['produits', field.name, 'produitId']);
                                                                        const quantite = getFieldValue(['produits', field.name, 'quantite']) || 0;
                                                                        const prixUnitaireTTC = produits.find((item) => item.id === pid)?.prixVenteTTC || 0;
                                                                        const prixTTC = Math.round(((prixUnitaireTTC * quantite) + Number.EPSILON) * 100) / 100;

                                                                        return (
                                                                            <Form.Item style={{ width: 150 }}>
                                                                                <InputNumber addonAfter="EUR" value={prixTTC} style={{ width: '100%' }} disabled />
                                                                            </Form.Item>
                                                                        );
                                                                    }}
                                                                </Form.Item>
                                                                {isEmptyLine && (
                                                                    <Button icon={<PlusOutlined />} title="Créer un produit" onClick={() => openNewProduitModal(field.name)} />
                                                                )}
                                                                <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                                            </Space>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </>
                                )
                            },
                            {
                                key: 'rappels',
                                label: 'Rappels',
                                children: (
                                    <>
                                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                                            <Col>
                                                <span style={{ color: '#666' }}>
                                                    Configurez les rappels automatiques par email envoyés au client avant la date de la prestation.
                                                </span>
                                            </Col>
                                            {isEdit && currentVente?.id && (
                                                <Col>
                                                    <Button
                                                        icon={<SendOutlined />}
                                                        onClick={async () => {
                                                            try {
                                                                await axios.post(`/ventes/${currentVente.id}/rappel`);
                                                                message.success('Rappel envoye avec succes');
                                                                axios.get<RappelHistoriqueEntity[]>(`/rappels/vente/${currentVente.id}`).then(res => setRappelHistorique(res.data)).catch(() => {});
                                                            } catch (err: any) {
                                                                message.error(err?.response?.data || 'Erreur lors de l\'envoi du rappel');
                                                            }
                                                        }}
                                                    >
                                                        Envoyer un rappel maintenant
                                                    </Button>
                                                </Col>
                                            )}
                                        </Row>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item name="rappel1Jours" label="Rappel 1 (jours avant)">
                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Ex: 30" addonAfter="jours" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name="rappel2Jours" label="Rappel 2 (jours avant)">
                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Ex: 7" addonAfter="jours" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item name="rappel3Jours" label="Rappel 3 (jours avant)">
                                                    <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Ex: 1" addonAfter="jours" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        {isEdit && rappelHistorique.length > 0 && (
                                            <>
                                                <h4 style={{ marginTop: 16 }}>Historique des rappels envoyes</h4>
                                                <Table
                                                    dataSource={rappelHistorique}
                                                    rowKey="id"
                                                    size="small"
                                                    pagination={false}
                                                    columns={[
                                                        {
                                                            title: 'Rappel',
                                                            dataIndex: 'numeroRappel',
                                                            width: 80,
                                                            render: (v: number) => v === 0 ? 'Manuel' : `#${v}`
                                                        },
                                                        {
                                                            title: 'Date d\'envoi',
                                                            dataIndex: 'dateEnvoi',
                                                            width: 160,
                                                            render: (v: string) => v ? new Date(v).toLocaleString('fr-FR') : '-'
                                                        },
                                                        {
                                                            title: 'Destinataire',
                                                            dataIndex: 'destinataire',
                                                            width: 200
                                                        },
                                                        {
                                                            title: 'Sujet',
                                                            dataIndex: 'sujet'
                                                        }
                                                    ]}
                                                />
                                            </>
                                        )}
                                    </>
                                )
                            },
                        ]}
                    />

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="montantHT" label="Montant HT">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="tva" label="TVA (%)">
                                <InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="remisePourcentage" label="Remise (%)">
                                <InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="remise" label="Remise (EUR)">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="montantTVA" label="Montant TVA">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="montantTTC" label="Montant TTC">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="prixVenteTTC" label="Prix vente TTC">
                                <InputNumber addonAfter="EUR" min={0} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Modal
                    title="Créer un produit"
                    open={newProduitModalVisible}
                    onOk={handleNewProduitSave}
                    onCancel={() => setNewProduitModalVisible(false)}
                    maskClosable={false}
                    width={1024}
                    okText="Enregistrer"
                    cancelText="Annuler"
                    destroyOnHidden
                >
                    <Form
                        form={newProduitForm}
                        layout="vertical"
                        initialValues={defaultNewProduit}
                        onValuesChange={onNewProduitValuesChange}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="marque" label="Marque">
                                    <AutoComplete allowClear options={marqueOptions} placeholder="Saisir/select. une marque" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="categorie" label="Catégorie" rules={[{ required: true, message: 'La catégorie est requise' }]}>
                                    <Select options={PRODUIT_CATEGORIES} placeholder="Choisir une catégorie" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="ref" label="Référence interne">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="images" label="Images">
                            <ImageUpload />
                        </Form.Item>
                        <Form.Item name="refs" label="Références complémentaires">
                            <Form.List name="refs">
                                {(fields, { add, remove: removeRef }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space key={field.key} align="baseline">
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Réf. complémentaire" style={{ width: 200 }} />
                                                </Form.Item>
                                                <Button icon={<DeleteOutlined />} danger onClick={() => removeRef(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                                            Ajouter une référence
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={3} placeholder="Description du produit" allowClear />
                        </Form.Item>
                        <Form.Item name="evaluation" label="Évaluation">
                            <Rate allowHalf />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="stock" label="Stock">
                                    <InputNumber min={0} step={1} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="stockMini" label="Stock minimal d'alerte">
                                    <InputNumber min={0} step={1} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="emplacement" label="Emplacement">
                            <Input />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="prixPublic" label="Prix public">
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="frais" label="Frais">
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="tauxMarge" label="Taux de marge (%)">
                                    <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="tauxMarque" label="Taux de marque (%)">
                                    <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="prixVenteHT" label="Prix de vente HT">
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="tva" label="TVA (%)">
                                    <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="montantTVA" label="Montant TVA">
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="prixVenteTTC" label="Prix de vente TTC">
                                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="€" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>

                <Modal
                    title={editServiceId ? "Modifier un service" : "Créer un service"}
                    open={newServiceModalVisible}
                    onOk={handleNewServiceSave}
                    onCancel={() => setNewServiceModalVisible(false)}
                    maskClosable={false}
                    width={1000}
                    okText="Enregistrer"
                    cancelText="Annuler"
                    destroyOnHidden
                >
                    <Form form={newServiceForm} layout="vertical" initialValues={defaultNewService} onValuesChange={onNewServiceValuesChange}>
                        <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                            <Input allowClear />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea rows={2} allowClear />
                        </Form.Item>
                        <Form.Item name="dureeEstimee" label="Durée estimée">
                            <InputNumber min={0} step={0.25} precision={2} style={{ width: '100%' }} addonAfter="h" />
                        </Form.Item>
                        <Tabs
                            defaultActiveKey="mainOeuvres"
                            items={[
                                {
                                    key: 'mainOeuvres',
                                    label: "Main d'Oeuvres",
                                    children: (
                                        <Form.List name="mainOeuvres">
                                            {(fields, { remove }) => (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <Row gutter={8} key={field.key} align="middle">
                                                            <Col span={16}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'mainOeuvreId']}
                                                                    label={index === 0 ? "Main d'Oeuvre" : undefined}
                                                                >
                                                                    <Select
                                                                        showSearch
                                                                        allowClear
                                                                        placeholder="Sélectionner une main d'oeuvre"
                                                                        options={mainOeuvreOptions}
                                                                        filterOption={(input, option) =>
                                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                                        }
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={5}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'quantite']}
                                                                    label={index === 0 ? 'Quantité' : undefined}
                                                                >
                                                                    <InputNumber min={0.25} step={0.25} style={{ width: '100%' }} />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={3}>
                                                                <Form.Item label={index === 0 ? ' ' : undefined}>
                                                                    {fields.length > 1 && (
                                                                        <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                                                    )}
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                </>
                                            )}
                                        </Form.List>
                                    )
                                },
                                {
                                    key: 'produits',
                                    label: 'Produits',
                                    children: (
                                        <Form.List name="produits">
                                            {(fields, { remove }) => (
                                                <>
                                                    {fields.map((field, index) => (
                                                        <Row gutter={8} key={field.key} align="middle">
                                                            <Col span={16}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'produitId']}
                                                                    label={index === 0 ? 'Produit' : undefined}
                                                                >
                                                                    <Select
                                                                        showSearch
                                                                        allowClear
                                                                        placeholder="Sélectionner un produit"
                                                                        options={produitOptionsForService}
                                                                        filterOption={(input, option) =>
                                                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                                        }
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={5}>
                                                                <Form.Item
                                                                    {...field}
                                                                    name={[field.name, 'quantite']}
                                                                    label={index === 0 ? 'Quantité' : undefined}
                                                                >
                                                                    <InputNumber min={1} style={{ width: '100%' }} />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={3}>
                                                                <Form.Item label={index === 0 ? ' ' : undefined}>
                                                                    {fields.length > 1 && (
                                                                        <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                                                    )}
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                </>
                                            )}
                                        </Form.List>
                                    )
                                }
                            ]}
                        />
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={6}><Form.Item name="prixHT" label="Prix HT"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="tva" label="TVA (%)"><InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="montantTVA" label="Montant TVA"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="prixTTC" label="Prix TTC"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                        </Row>
                    </Form>
                </Modal>

                <Modal
                    title="Créer un forfait"
                    open={newForfaitModalVisible}
                    onOk={handleNewForfaitSave}
                    onCancel={() => setNewForfaitModalVisible(false)}
                    maskClosable={false}
                    width={900}
                    okText="Enregistrer"
                    cancelText="Annuler"
                    destroyOnHidden
                >
                    <Form form={newForfaitForm} layout="vertical" initialValues={defaultNewForfait} onValuesChange={onNewForfaitValuesChange}>
                        <Form.Item name="reference" label="Référence" rules={[{ required: true, message: 'La référence est requise' }]}>
                            <Input allowClear />
                        </Form.Item>
                        <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                            <Input allowClear />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={6}><Form.Item name="prixHT" label="Prix HT"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="tva" label="TVA (%)"><InputNumber addonAfter="%" min={0} max={100} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="montantTVA" label="Montant TVA"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                            <Col span={6}><Form.Item name="prixTTC" label="Prix TTC"><InputNumber addonAfter="€" min={0} step={0.01} style={{ width: '100%' }} /></Form.Item></Col>
                        </Row>
                    </Form>
                </Modal>
            </Modal>

            <Modal
                title="Créer un client"
                open={newClientModalVisible}
                onOk={handleNewClientSave}
                onCancel={() => setNewClientModalVisible(false)}
                maskClosable={false}
                width={800}
                okText="Enregistrer"
                cancelText="Annuler"
                destroyOnHidden
            >
                <Form form={newClientForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Le type est requis' }]}>
                                <Select options={[
                                    { value: 'PARTICULIER', label: 'Particulier' },
                                    { value: 'PROFESSIONNEL', label: 'Professionnel' },
                                    { value: 'PROFESSIONNEL_MER', label: 'Professionnel de la Mer' },
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                            {({ getFieldValue }) =>
                                getFieldValue('type') === 'PARTICULIER' && (
                                    <Col span={12}>
                                        <Form.Item name="prenom" label="Prénom">
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                )
                            }
                        </Form.Item>
                        <Col span={12}>
                            <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email">
                                <Input type="email" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="telephone" label="Téléphone">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="adresse" label="Adresse">
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} allowClear />
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                        {({ getFieldValue }) =>
                            getFieldValue('type') !== 'PARTICULIER' && (
                                <>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="siren" label="SIREN">
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="siret" label="SIRET">
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="tva" label="TVA">
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="naf" label="NAF">
                                                <Input allowClear />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )
                        }
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="remise" label="Remise (%)">
                                <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} addonAfter="%" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="evaluation" label="Évaluation">
                                <Rate allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={3} allowClear />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Créer un bateau"
                open={newBateauModalVisible}
                onOk={handleNewBateauSave}
                onCancel={() => setNewBateauModalVisible(false)}
                maskClosable={false}
                width={800}
                okText="Enregistrer"
                cancelText="Annuler"
                destroyOnHidden
            >
                <Form form={newBateauForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="immatriculation" label="Immatriculation">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="numeroSerie" label="Numéro de série">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="numeroClef" label="Numéro clef">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateMeS" label="Date MeS">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateAchat" label="Date achat">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateFinDeGuarantie" label="Date fin garantie">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="localisation" label="Localisation">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="localisationGps" label="Localisation GPS">
                                <Input allowClear placeholder="lat, lng" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Modèle catalogue">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Associer à un modèle du catalogue"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={catalogueBateaux.map((b) => ({ value: b.id, label: `${b.marque || ''} ${b.modele || ''}`.trim() }))}
                                onChange={(value) => newBateauForm.setFieldValue('modele', value ? { id: value } : undefined)}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un modèle" onClick={() => history.push('/catalogue/bateaux')} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="Propriétaires">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                mode="multiple"
                                showSearch
                                allowClear
                                placeholder="Sélectionner les propriétaires"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={clientOptions}
                                onChange={(values) => newBateauForm.setFieldValue('proprietaires', (values || []).map((id: number) => ({ id })))}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un client" onClick={openNewClientModal} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="Moteurs">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                mode="multiple"
                                showSearch
                                allowClear
                                placeholder="Sélectionner les moteurs à associer"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={catalogueMoteurs.map((m) => ({ value: m.id, label: `${m.marque || ''} ${m.modele || ''}`.trim() }))}
                                onChange={(values) => newBateauForm.setFieldValue('moteurs', (values || []).map((id: number) => ({ id })))}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un moteur" onClick={() => history.push('/catalogue/moteurs')} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item name="images" label="Images">
                        <ImageUpload />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Créer un moteur"
                open={newMoteurModalVisible}
                onOk={handleNewMoteurSave}
                onCancel={() => setNewMoteurModalVisible(false)}
                maskClosable={false}
                width={800}
                okText="Enregistrer"
                cancelText="Annuler"
                destroyOnHidden
            >
                <Form form={newMoteurForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="numeroSerie" label="Numéro de série" rules={[{ required: true, message: 'Le numéro de série est requis' }]}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="numeroClef" label="Numéro de clef">
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateMeS" label="Date MeS">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateAchat" label="Date achat">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateFinDeGuarantie" label="Date fin garantie">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Modèle catalogue">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Associer à un modèle du catalogue"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={catalogueMoteurs.map((m) => ({ value: m.id, label: `${m.marque || ''} ${m.modele || ''}`.trim() }))}
                                onChange={(value) => newMoteurForm.setFieldValue('modele', value ? { id: value } : undefined)}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un modèle" onClick={() => history.push('/catalogue/moteurs')} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="Propriétaire">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Sélectionner le propriétaire"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={clientOptions}
                                onChange={(value) => newMoteurForm.setFieldValue('proprietaire', value ? { id: value } : undefined)}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un client" onClick={openNewClientModal} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item name="images" label="Images">
                        <ImageUpload />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Créer une remorque"
                open={newRemorqueModalVisible}
                onOk={handleNewRemorqueSave}
                onCancel={() => setNewRemorqueModalVisible(false)}
                maskClosable={false}
                width={800}
                okText="Enregistrer"
                cancelText="Annuler"
                destroyOnHidden
            >
                <Form form={newRemorqueForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="immatriculation" label="Immatriculation" rules={[{ required: true, message: "L'immatriculation est requise" }]}>
                                <Input allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="dateMeS" label="Date MeS">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateAchat" label="Date achat">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateFinDeGuarantie" label="Date fin garantie">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Modèle catalogue">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Associer à un modèle du catalogue"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={catalogueRemorques.map((r) => ({ value: r.id, label: `${r.marque || ''} ${r.modele || ''}`.trim() }))}
                                onChange={(value) => newRemorqueForm.setFieldValue('modele', value ? { id: value } : undefined)}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un modèle" onClick={() => history.push('/catalogue/remorques')} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item label="Propriétaire">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Sélectionner le propriétaire"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                options={clientOptions}
                                onChange={(value) => newRemorqueForm.setFieldValue('proprietaire', value ? { id: value } : undefined)}
                                style={{ width: '100%' }}
                            />
                            <Button icon={<PlusOutlined />} title="Créer un client" onClick={openNewClientModal} />
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item name="images" label="Images">
                        <ImageUpload />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
