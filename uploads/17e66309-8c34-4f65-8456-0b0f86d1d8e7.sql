SELECT * FROM entrevistados;
SELECT * FROM entrevistador;
SELECT * FROM questionario;

SET SQL_SAFE_UPDATES = 0;

DELETE FROM questionario;

DELETE FROM entrevistador;

DELETE FROM entrevistados;
DELETE FROM entrevistador;
DELETE FROM questionario;

CREATE TABLE entrevistador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    jobtitle VARCHAR(255),
    location VARCHAR(255),
    functional_area VARCHAR(255)
);

ALTER TABLE questionario
MODIFY COLUMN Documentacao VARCHAR(10000);



ALTER TABLE questionario MODIFY Resposta VARCHAR(500);
ALTER TABLE entrevistados auto_increment = 1;


ALTER TABLE questionario
DROP constraint fk_user_id;




ALTER TABLE entrevistados 
MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE questionario 
ADD COLUMN Documentacao BLOB;

ALTER TABLE entrevistados RENAME TO utilizadores;
ALTER TABLE entrevistados DROP PRIMARY KEY;
ALTER TABLE entrevistados ADD PRIMARY KEY (id);

DELETE FROM entrevistados;

ALTER TABLE questionario 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) 
REFERENCES entrevistados(id);