-- Test data for integration tests

-- Users
INSERT INTO UserEntity (name, password, email, roles, theme) VALUES ('admin', 'admin123', 'admin@test.com', 'ADMIN', 0);
INSERT INTO UserEntity (name, password, email, roles, theme) VALUES ('technicien1', 'tech123', 'tech@test.com', 'TECHNICIEN', 0);

-- Clients (use high IDs to avoid sequence conflicts)
INSERT INTO ClientEntity (id, nom, prenom, type, email, telephone, adresse, consentement, evaluation, remise, date) VALUES (100, 'Dupont', 'Jean', 'Particulier', 'jean.dupont@test.com', '0612345678', '1 rue du Port', true, 4.5, 0.0, '2025-01-15');
INSERT INTO ClientEntity (id, nom, prenom, type, email, telephone, adresse, consentement, evaluation, remise, date) VALUES (101, 'Martin', 'Sophie', 'Professionnel', 'sophie.martin@test.com', '0698765432', '2 avenue de la Mer', true, 3.0, 10.0, '2025-02-20');

-- Techniciens
INSERT INTO TechnicienEntity (id, nom, prenom, email, telephone, couleur) VALUES (100, 'Leclerc', 'Pierre', 'pierre.leclerc@test.com', '0611223344', '#FF5733');

-- Catalogue bateaux
INSERT INTO BateauCatalogueEntity (id, modele, marque, type, description, evaluation, annee, longueurExterieure, largeur, poidsVide, stock, stockAlerte, prixPublic, prixVenteHT, tva, montantTVA, prixVenteTTC, frais, tauxMarge, tauxMarque, longueurCoque, hauteur, tirantAir, tirantEau, poidsMoteurMax, chargeMax, reservoirEau, reservoirCarburant, nombrePassagersMax) VALUES (100, 'Quicksilver 505', 'Quicksilver', 'Open', 'Bateau open polyvalent', 4.0, 2024, 5.05, 2.10, 650, 3, 1, 25000.0, 22000.0, 20.0, 4400.0, 26400.0, 500.0, 10.0, 9.0, 4.80, 1.50, 2.0, 0.5, 200.0, 800.0, 50.0, 100.0, 6);

-- Reset sequences to avoid conflicts with pre-inserted data
ALTER TABLE ClientEntity ALTER COLUMN id RESTART WITH 200;
ALTER TABLE TechnicienEntity ALTER COLUMN id RESTART WITH 200;
ALTER TABLE BateauCatalogueEntity ALTER COLUMN id RESTART WITH 200;
