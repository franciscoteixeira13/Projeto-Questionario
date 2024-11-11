SELECT * FROM entrevistados;
SELECT * FROM questionario;

SET SQL_SAFE_UPDATES = 0;

ALTER TABLE questionario MODIFY Resposta VARCHAR(1000);
ALTER TABLE entrevistados auto_increment = 1;
DELETE FROM entrevistados;

ALTER TABLE questionario
drop COLUMN documentacao;

ALTER TABLE entrevistados 
MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE entrevistados 
MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE entrevistados DROP PRIMARY KEY;
ALTER TABLE entrevistados ADD PRIMARY KEY (id);

DELETE FROM entrevistados;

ALTER TABLE questionario 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) 
REFERENCES entrevistados(id);