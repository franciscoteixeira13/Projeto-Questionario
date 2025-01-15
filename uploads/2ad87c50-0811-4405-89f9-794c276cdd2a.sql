-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: projeto_questionario
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `entrevistados`
--

DROP TABLE IF EXISTS `entrevistados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrevistados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `jobtitle` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `functional_area` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrevistados`
--

LOCK TABLES `entrevistados` WRITE;
/*!40000 ALTER TABLE `entrevistados` DISABLE KEYS */;
INSERT INTO `entrevistados` VALUES (24,NULL,NULL,NULL,NULL),(25,NULL,NULL,NULL,NULL),(26,NULL,NULL,NULL,NULL),(27,NULL,NULL,NULL,NULL),(28,NULL,NULL,NULL,NULL),(29,NULL,NULL,NULL,NULL),(30,'teste1','teste1','teste1','teste1'),(31,'teste1','teste1','teste1','teste1'),(32,'teste1','teste1','teste1','teste1'),(33,'teste1','teste1','teste1','teste1'),(34,'teste1','teste1','teste1','teste1'),(35,'teste1','teste1','teste1','teste1'),(36,'teste1','teste1','teste1','teste1'),(37,'teste1','teste1','teste1','teste1'),(38,'teste1','teste1','teste1','teste1'),(39,'teste1','teste1','teste1','teste1'),(40,'teste1','teste1','teste1','teste1');
/*!40000 ALTER TABLE `entrevistados` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-09 22:01:55
