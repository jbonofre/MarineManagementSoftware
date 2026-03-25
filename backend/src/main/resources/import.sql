MERGE INTO userEntity(name, roles, password, email) KEY(name) VALUES('admin', 'admin', 'admin', 'contact@msplaisance.com');

MERGE INTO societeEntity(id, nom, siren, capital, adresse) KEY(id) VALUES(1, 'A changer', 'A changer', 0, 'A changer');

