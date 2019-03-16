-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: localhost    Database: hungry_jars
-- ------------------------------------------------------
-- Server version	5.7.23-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(45) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Jams','2018-07-22 13:58:25',1),(2,'Pickles','2018-07-22 13:58:38',1),(3,'Butters','2018-07-22 13:58:44',1),(4,'Masalas','2018-07-22 13:58:50',1),(5,'More','2018-07-22 13:58:55',1),(6,'Combo','2018-08-12 07:12:25',1);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combo_order_details`
--

DROP TABLE IF EXISTS `combo_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `combo_order_details` (
  `combo_order_detail_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `combo_id` int(11) DEFAULT NULL,
  `quantity_ordered` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`combo_order_detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combo_order_details`
--

LOCK TABLES `combo_order_details` WRITE;
/*!40000 ALTER TABLE `combo_order_details` DISABLE KEYS */;
INSERT INTO `combo_order_details` VALUES (1,24,1,1,425,'2018-08-17 10:39:34'),(2,25,1,1,425,'2018-08-17 10:50:44'),(3,26,1,1,425,'2018-08-17 10:51:42'),(4,27,1,1,425,'2018-08-17 10:52:42'),(5,32,2,1,499,'2018-08-21 10:06:44'),(6,33,2,1,499,'2018-08-21 10:10:28'),(7,35,1,1,425,'2018-08-24 07:15:59'),(8,38,1,4,1700,'2018-08-27 07:01:41');
/*!40000 ALTER TABLE `combo_order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combo_products`
--

DROP TABLE IF EXISTS `combo_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `combo_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `combo_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combo_products`
--

LOCK TABLES `combo_products` WRITE;
/*!40000 ALTER TABLE `combo_products` DISABLE KEYS */;
INSERT INTO `combo_products` VALUES (1,1,25,'2018-08-17 09:03:20'),(2,1,26,'2018-08-17 09:03:20'),(3,2,25,'2018-08-21 10:04:53'),(4,2,26,'2018-08-21 10:04:53');
/*!40000 ALTER TABLE `combo_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combos`
--

DROP TABLE IF EXISTS `combos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `combos` (
  `combo_id` int(11) NOT NULL AUTO_INCREMENT,
  `sku_id` varchar(20) DEFAULT NULL,
  `combo_name` varchar(20) DEFAULT NULL,
  `price` int(10) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`combo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combos`
--

LOCK TABLES `combos` WRITE;
/*!40000 ALTER TABLE `combos` DISABLE KEYS */;
INSERT INTO `combos` VALUES (1,'HJCOMBO001','The Quick Fix',425,'2018-08-17 09:03:20'),(2,'HJCOMBO005','Rakhi Gift Box',499,'2018-08-21 10:04:53');
/*!40000 ALTER TABLE `combos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `customer_id` int(100) NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(200) NOT NULL,
  `customer_address` varchar(1000) NOT NULL,
  `customer_state` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `pincode` bigint(20) NOT NULL,
  `phone` bigint(20) NOT NULL,
  `email` varchar(200) NOT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Kiran Tikka','H - 11/4 DLF Phase 1, Near Silver Oak, Sikandarpur','Haryana','Gurgaon',122002,9891274473,''),(2,'Sharmila','B7 Extension 115, Ground Floor, Safdarjung Enclave,','Delhi','Delhi',110029,9818148629,''),(3,'Tsureno Sikka','B-540, 1st Floor, New Friends Colony','Delhi','Delhi',110025,9818165187,''),(4,'Neha Bajaj','2, Janpath Road','Delhi','Delhi',110001,9818015000,''),(5,'Ritul Chaurasia','B-2 Surya Nagar','Uttar Pradesh','Ghaziabad',201011,9811408573,''),(6,'Ajay Arjun','308, Enchanting Glen, Rustam Bagh Main Road','Karnataka','Bangalore',560017,9654904517,''),(7,'Madhu Haruray','1 Park Avenue , Maharani Bagh','Delhi','Delhi',110065,9350743113,''),(8,'Little Black Book Delhi','4th floor, Community Center, 10, Raja Dhirsain Marg, D Block, East of Kailash','Delhi','Delhi',110065,9999679404,'prateek@lbbd.in'),(9,'Kuljot Saluja','TB (Third Floor), Golden Daffodils 1st Cross Rd, HAL 3rd Stage, Kodihalli','Karnataka','Bangalore',560008,8447323935,'saluja.kuljot@gmail.com'),(10,'Ankrish Bhayana','R-304, Greater Kailash - Part I','Delhi','Delhi',110048,9873837137,'ankrish.chatterbox@gmail.com'),(11,'Om','122, 4th Floor, Shahpur Jat','Delhi','Delhi',110049,7738009744,''),(12,'Sanjhi Rajgarhia','D 1003 New Friends Colony','Delhi','Delhi',110025,7042640064,'email@foodcloud.in'),(13,'Shivangana Vasudeva',' D-1082 New Friends Colony','Delhi','New Delhi',110025,9958930875,'shivangana@eattreat.in'),(14,'Vikas Oberoi ','Plot No 233, GF, FIE, Industrial Area, Patparganj','Delhi','Delhi',110092,9643981981,''),(15,'Aayush Sinha','Flat 302, Abhinava Sunrise Apartment, PWD Road, B Narayanapura, Mahadevpura','Karnataka','Bangalore',560016,9740855722,'aayushsinha2005@gmail.com'),(16,'Garima','B 123, Dayanand Colony, Lajpat Nagar-IV','Delhi','Delhi',110024,9650015676,'malikgarima2006@gmail.com'),(17,'Dhruv Mathur','4th Floor, C 84, Defence Colony','Delhi','Delhi',110024,9871949082,'dhruv.m24@gmail.com'),(18,'Suchita Salwan','4th Floor, C 84, Defence Colony','Delhi','Delhi',110024,9810444122,'suchita@lbb.in'),(19,'C Salam','Akshram, Behind TAJ TVS Showroom Purani Itarsi','Madhya Pradesh','Itarsi',461111,9425643760,''),(20,'Sarita Kapur','Neelkant Colony, 1/4 Gokhale Marg','Uttar Pradesh','Lucknow',226001,9936428333,''),(21,'Verandah','37/3, Top Floor, East Patel Nagar','Delhi','Delhi',110006,9953240242,''),(22,'Narendra Solanki','A-1404, Regalia Apartment, VIRAR WEST','Maharashtra','Virar',401303,7350233484,''),(23,'Vanshita Agrawal','M-14/32, DLF Phase 2','Haryana','Gurgaon',122022,9004136458,''),(24,'Kadambari Kumar','170, Sector A Pocket C, Vasant Kunj','Delhi','Delhi',110070,9958492377,''),(25,'Niranjana Vinod','3515, 3rd floor,near sector 23 market, Opposite mother dairy','Haryana','Gurgaon',122017,8527492216,''),(26,'Deepit Purkayastha','J-1963, 2nd Floor, CR Park','Delhi','Delhi',110019,9818659988,''),(27,'Vibha','B-304, Sambhavana Apartments, Plot No - 8, Sect - 22','Delhi','Delhi',110077,9810466140,''),(28,'Lifestyle Bazaar','Main Park, A-1 Block, Pansheel Enclave','Delhi','Delhi',110017,8810494769,'oh.lifestylebazaar@gmail.com'),(29,'Radhika Agarwal','E-4/145, First Floor,  Sector - 7, Rohini','Delhi','Delhi',110085,9810060091,'agarwalradhika76@gmail.com'),(30,'Mehul Prasad','9A, Thornhill Road','Uttar Pradesh','Allahabad',211001,9711987944,''),(31,'Aman Trehan','Prestige St. John’s wood  Birch- 1105 , Tavarekere Main Road','Karnataka','Bangalore',560029,8527873426,''),(32,'Anil Bajaj','Prestige St. John’s wood  Birch- 1105 , Tavarekere Main Road','Karnataka','Bangalore',560029,8971174000,''),(33,'Vyoma Madaan','Flat no. 19, GFF, 19/1-D, Kanishka Residency, Sector 35 Opposite Mandir','Haryana','Faridabad',121003,9711518411,'vyomamadaan_007@yahoo.co.in'),(34,'Abhishek Agarwal','Kakurgachi','West Bengal','Kolkata',700054,9831629515,''),(35,'Anupriya Singh','G D Goenka Public School, Sector B 8 & 9, Vasant Kunj','Delhi','Delhi',110070,9810175000,''),(36,'Anjali Trehan','B-540, First Floor, New Friends Colony, New Delhi','Delhi','New Delhi',110025,9810194870,''),(37,'Kajal Aswani','R-112, Greater Kailash 1, New Delhi','Delhi','New Delhi',110048,9910540800,''),(38,'Hoofrish','E-302, Pioneer Park, Sector 61','Haryana','Gurgaon',122001,9811399169,''),(39,'Kirat Sodhi','E-352, 2nd Floor, Greater Kailash - 2','Delhi','New Delhi',110048,9873853517,'');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_details` (
  `order_detail_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` int(10) DEFAULT NULL,
  `product_id` int(10) DEFAULT NULL,
  `jars` int(10) DEFAULT NULL,
  `amount` varchar(100) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_detail_id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (12,4,19,2,'400','2018-07-23 14:18:45'),(20,8,25,25,'0','2018-07-30 16:57:46'),(21,9,6,1,'180','2018-07-30 17:00:23'),(22,9,26,1,'250','2018-07-30 17:00:23'),(23,10,23,2,'440','2018-08-02 07:15:29'),(24,10,13,2,'550','2018-08-02 07:15:29'),(25,11,26,1,'0','2018-08-03 07:39:58'),(26,12,11,1,'200','2018-08-03 10:20:40'),(27,12,10,1,'200','2018-08-03 10:20:40'),(28,13,25,1,'0','2018-08-03 11:44:13'),(29,13,26,1,'0','2018-08-03 11:44:13'),(30,14,6,1,'0','2018-08-06 14:15:08'),(31,14,23,1,'0','2018-08-06 14:15:08'),(32,15,25,3,'0','2018-08-07 05:54:17'),(33,16,4,1,'180','2018-08-07 06:54:29'),(34,16,24,1,'250','2018-08-07 06:54:29'),(35,17,3,1,'165','2018-08-10 09:09:55'),(36,18,25,1,'240','2018-08-12 07:57:48'),(37,18,26,1,'210','2018-08-12 07:57:48'),(38,19,25,1,'240','2018-08-12 07:58:41'),(39,19,26,1,'210','2018-08-12 07:58:41'),(40,20,11,1,'200','2018-08-16 07:16:09'),(49,23,4,1,'180','2018-08-16 09:27:46'),(50,28,9,1,'200','2018-08-20 06:37:55'),(51,29,9,1,'200','2018-08-20 07:45:18'),(52,29,11,2,'400','2018-08-20 07:45:18'),(53,29,7,1,'180','2018-08-20 07:45:18'),(54,29,6,3,'540','2018-08-20 07:45:18'),(55,29,26,1,'210','2018-08-20 07:45:18'),(56,29,8,3,'600','2018-08-20 07:45:18'),(57,29,19,1,'200','2018-08-20 07:45:18'),(58,30,25,1,'0','2018-08-21 10:02:36'),(59,30,26,1,'0','2018-08-21 10:02:36'),(60,31,25,1,'0','2018-08-21 10:03:51'),(61,31,26,1,'0','2018-08-21 10:03:51'),(66,36,26,1,'0','2018-08-24 09:54:33'),(67,37,6,1,'0','2018-08-24 09:55:12'),(71,1,19,4,'800','2018-08-24 12:57:08'),(72,2,9,1,'200','2018-08-24 12:57:23'),(73,3,11,1,'200','2018-08-24 12:57:33'),(74,6,8,1,'0','2018-08-24 12:57:47'),(75,7,13,1,'275','2018-08-24 12:57:58'),(85,22,25,3,'720','2018-08-27 07:15:18'),(86,22,26,3,'630','2018-08-27 07:15:18'),(95,34,8,1,'200','2018-08-28 06:45:30'),(96,34,5,1,'180','2018-08-28 06:45:30'),(97,34,6,1,'180','2018-08-28 06:45:30'),(98,34,3,1,'165','2018-08-28 06:45:30'),(101,39,8,1,'200','2018-08-28 09:25:53'),(102,39,7,1,'180','2018-08-28 09:25:53'),(107,40,9,1,'0','2018-08-28 13:09:51'),(108,21,9,1,'200','2018-08-28 13:27:43'),(109,21,6,1,'180','2018-08-28 13:27:43'),(110,5,8,2,'400','2018-08-29 06:49:56'),(111,5,9,1,'200','2018-08-29 06:49:56'),(112,5,23,1,'200','2018-08-29 06:49:56'),(115,42,8,2,'400','2018-08-29 13:46:12'),(116,42,9,1,'200','2018-08-29 13:46:12'),(117,42,11,1,'200','2018-08-29 13:46:12'),(118,43,8,1,'200','2018-08-29 13:50:03'),(119,43,26,1,'210','2018-08-29 13:50:03'),(120,43,13,1,'275','2018-08-29 13:50:03'),(127,41,6,1,'180','2018-08-30 01:45:00'),(128,41,9,1,'200','2018-08-30 01:45:00'),(129,41,3,1,'165','2018-08-30 01:45:00');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_logs`
--

DROP TABLE IF EXISTS `order_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `text` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_logs`
--

LOCK TABLES `order_logs` WRITE;
/*!40000 ALTER TABLE `order_logs` DISABLE KEYS */;
INSERT INTO `order_logs` VALUES (1,39,'Payment received.',8,'2018-08-29 12:00:14'),(2,41,'Order Edited',9,'2018-08-29 14:03:05'),(3,41,'Order Edited',9,'2018-08-29 14:03:51'),(4,41,'Order Edited',6,'2018-08-30 01:45:00');
/*!40000 ALTER TABLE `order_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int(100) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_type` varchar(100) DEFAULT NULL,
  `order_source` varchar(100) NOT NULL,
  `note` varchar(1000) NOT NULL,
  `status` varchar(100) DEFAULT NULL,
  `payment_received` tinyint(1) NOT NULL,
  `total_discount_in_rs` int(11) NOT NULL,
  `promo_code_id` int(11) NOT NULL,
  `track_company_url` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'2018-07-23 09:03:24','1','HJ Team','','3',1,0,0,NULL),(2,2,'2018-07-24 07:14:18','1','HJ Team','','3',1,0,0,NULL),(3,3,'2018-07-24 07:46:17','1','HJ Team','','3',1,0,0,NULL),(4,4,'2018-07-26 06:35:34','Paytm','Whatsapp','','3',1,0,0,NULL),(5,5,'2018-07-26 09:43:37','Paytm','HJ Team','','3',0,0,0,NULL),(6,6,'2018-07-26 13:16:54','Gift','HJ Team','','3',1,0,0,NULL),(7,7,'2018-07-26 13:38:45','1','HJ Team','','3',1,0,0,NULL),(8,8,'2018-07-30 16:57:46','Gift','Others','Contact Person - Prateek Agarwal','3',1,0,0,NULL),(9,9,'2018-07-30 17:00:23','Paytm','HJ Team','','3',1,0,0,NULL),(10,10,'2018-08-02 07:15:29','Cash','HJ Team','','3',0,0,0,NULL),(11,11,'2018-08-03 07:39:58','Gift','HJ Team','','3',1,0,0,NULL),(12,12,'2018-08-03 10:20:40','Cash','Foodcloud','','3',0,0,0,NULL),(13,13,'2018-08-03 11:44:13','Gift','HJ Team','HJ Rakhi Box - Eat Treat','3',1,0,0,NULL),(14,14,'2018-08-06 14:15:08','Sample','HJ Team','For Export  (Rudra Agro Exports)','3',1,0,0,NULL),(15,14,'2018-08-07 05:54:17','Sample','HJ Team','','3',1,0,0,NULL),(16,15,'2018-08-07 06:54:29','Paytm','HJ Team','','3',1,0,0,NULL),(17,16,'2018-08-10 09:09:55','Cash','Whatsapp','','3',1,0,0,NULL),(18,17,'2018-08-12 07:57:48','','LBB','','3',0,0,0,NULL),(19,18,'2018-08-12 07:58:41','','LBB','','3',0,0,0,NULL),(20,19,'2018-08-16 07:16:09','payment_gateway','Amazon','','3',0,0,0,NULL),(21,20,'2018-08-16 07:48:50','Paytm','HJ Team','','3',1,0,0,NULL),(22,21,'2018-08-16 07:58:09','Paytm','Others','','3',1,0,0,NULL),(23,22,'2018-08-16 09:27:46','payment_gateway','Amazon','','3',0,0,0,NULL),(24,23,'2018-08-17 10:39:34','payment_gateway','Amazon','','3',0,0,0,NULL),(25,24,'2018-08-17 10:50:44','','LBB','','3',0,0,0,NULL),(26,25,'2018-08-17 10:51:42','','LBB','','3',0,0,0,NULL),(27,26,'2018-08-17 10:52:42','','LBB','','3',0,0,0,NULL),(28,27,'2018-08-20 06:37:55','Cash','Call','','3',1,0,0,NULL),(29,28,'2018-08-20 07:45:18','Event','Others','Contact person - Anupriya','3',1,0,0,NULL),(30,21,'2018-08-21 10:02:36','Gift','Others','Rakhi Free Box','3',1,0,0,NULL),(31,29,'2018-08-21 10:03:51','Gift','Others','Rakhi Gift Box','3',1,0,0,NULL),(32,30,'2018-08-21 10:06:44','Cash','HJ Team','','2',1,75,2,'http://www.tpcglobe.com/Tracking2014.aspx?id=DEL203049658&type=0&service=0'),(33,31,'2018-08-21 10:10:28','Cash','HJ Team','','3',1,75,2,'http://www.b4express.com/Track.aspx?AWBNo=1077242'),(34,32,'2018-08-21 10:11:57','cash','HJ Team','','3',1,109,2,'http://www.b4express.com/Track.aspx?AWBNo=1077243'),(35,33,'2018-08-24 07:15:59','payment_gateway','LBB','','3',0,0,0,'http://www.tpcglobe.com/Tracking2014.aspx?id=DEL114297786&type=0&service=0'),(36,29,'2018-08-24 09:54:33','Gift','Others','Replacement Jar for broken','3',1,0,0,'http://www.tpcglobe.com/Tracking2014.aspx?id=DEL114297785&type=0&service=0'),(37,20,'2018-08-24 09:55:12','Gift','Others','Replacement Jar for broken delivery','3',1,0,0,'http://www.tpcglobe.com/Tracking2014.aspx?id=DEL114297784&type=0&service=0'),(38,34,'2018-08-27 07:01:41','Cash','HJ Team','','3',1,0,0,NULL),(39,35,'2018-08-28 09:25:53','Paytm','HJ Team','','3',1,0,0,'http://www.tpcglobe.com/Tracking2014.aspx?id=DEL114297793&type=0&service=0'),(40,36,'2018-08-28 13:07:15','Gift','HJ Team','','3',1,0,0,NULL),(41,37,'2018-08-29 13:42:25','','HJTeam','','1',0,0,0,NULL),(42,38,'2018-08-29 13:46:12','','HJ Team','','1',0,0,0,NULL),(43,39,'2018-08-29 13:50:03','','HJ Team','','1',0,0,0,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT NULL,
  `selling_quantity_gms` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `jars` int(11) NOT NULL,
  `ingredients` varchar(700) DEFAULT NULL,
  `instructions` varchar(700) DEFAULT NULL,
  `spcialist_id` int(11) DEFAULT NULL,
  `icon_url` varchar(200) DEFAULT NULL,
  `sku_id` varchar(500) NOT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Banana Rum Jam',1,'2018-07-22 13:59:41',250,240,0,'','',NULL,NULL,'HJ0001',1),(2,'Chunky Spiced Apple Jam',1,'2018-07-22 14:00:15',250,210,0,'','',NULL,NULL,'HJ0002',1),(3,'Spicy Green Chilli Pickle',2,'2018-07-22 14:00:49',150,165,11,'','',NULL,NULL,'HJ0003',1),(4,'Stuffed Red Chilli Pickle',2,'2018-07-22 14:01:25',150,180,0,'','',NULL,NULL,'HJ0004',1),(5,'Stuffed Green Chilli Pickle',2,'2018-07-22 14:02:04',150,180,24,'','',NULL,NULL,'HJ0005',1),(6,'Indie Mix Pickle',2,'2018-07-22 14:02:54',200,180,24,'','',NULL,NULL,'HJ0006',1),(7,'Lasora Pickle',2,'2018-07-22 14:03:28',200,180,3,'','',NULL,NULL,'HJ0007',1),(8,'Red Chilli Pickle with Chana Dal',2,'2018-07-22 14:03:59',250,200,1,'','',NULL,NULL,'HJ0008',1),(9,'Mango Pickle',2,'2018-07-22 14:04:29',250,200,21,'','',NULL,NULL,'HJ0009',1),(10,'Sweet Mango Pickle',2,'2018-07-22 14:04:57',250,200,7,'','',NULL,NULL,'HJ0010',1),(11,'Sweet Mango Relish',2,'2018-07-22 14:05:22',300,200,34,'','',NULL,NULL,'HJ0011',1),(12,'Sweet & Sour Lemon Relish',2,'2018-07-22 14:05:51',300,200,0,'','',NULL,NULL,'HJ0012',1),(13,'Herb Garlic Butter',3,'2018-07-22 14:06:35',200,275,-1,'','',NULL,NULL,' HJ0013',1),(14,'Mixed Herb Butter',3,'2018-07-22 14:06:59',200,275,0,'','',NULL,NULL,'HJ0014',1),(15,'Pepper Butter',3,'2018-07-22 14:07:21',200,275,0,'','',NULL,NULL,'HJ0015',1),(16,'Piri Piri Butter',3,'2018-07-22 14:07:48',200,275,0,'','',NULL,NULL,'HJ0016',1),(17,'Almond Butter',3,'2018-07-22 14:08:10',220,450,0,'','',NULL,NULL,'HJ0017',1),(18,'Cashew Butter',3,'2018-07-22 14:08:34',220,450,0,'','',NULL,NULL,'HJ0018',1),(19,'Sambar Masala',4,'2018-07-22 14:08:58',100,200,15,'','',NULL,NULL,'HJ0019',1),(20,'Biryani Masala',4,'2018-07-22 14:09:22',100,220,14,'','',NULL,NULL,'HJ0020',1),(21,'Garam Masala',4,'2018-07-22 14:09:41',100,220,0,'','',NULL,NULL,'HJ0021',1),(22,'Chilli Chicken Masala',4,'2018-07-22 14:10:08',150,220,7,'','',NULL,NULL,'HJ0022',1),(23,'Chilli Garlic Sauce',5,'2018-08-06 12:48:51',250,200,14,'','',NULL,NULL,'HJ0023',1),(24,'Coffee Chocolate Ganache',5,'2018-07-22 14:11:09',250,250,0,'','',NULL,NULL,'HJ0024',1),(25,'Classic Coffee Mix',5,'2018-07-22 14:12:04',250,240,10,'','',NULL,NULL,'HJ0025',1),(26,'Hot Chocolate Mix',5,'2018-07-22 14:12:25',250,210,10,'','',NULL,NULL,'HJ0026',1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_code`
--

DROP TABLE IF EXISTS `promo_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promo_code` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `total_valid_count` int(10) NOT NULL,
  `remaning_valid_count` int(10) NOT NULL,
  `discount_percentage` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_code`
--

LOCK TABLES `promo_code` WRITE;
/*!40000 ALTER TABLE `promo_code` DISABLE KEYS */;
INSERT INTO `promo_code` VALUES (2,'HJFNF15','For Friends and Family','2018-07-25 18:30:00','2018-12-30 18:30:00',100,95,15),(5,'6FOR1','Send 6 Jars Get 1 Free','2018-08-27 18:30:00','2018-12-30 18:30:00',50,47,100);
/*!40000 ALTER TABLE `promo_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialist`
--

DROP TABLE IF EXISTS `specialist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `specialist` (
  `specialist_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `created_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`specialist_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialist`
--

LOCK TABLES `specialist` WRITE;
/*!40000 ALTER TABLE `specialist` DISABLE KEYS */;
/*!40000 ALTER TABLE `specialist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) DEFAULT NULL,
  `quantity_gms` int(11) DEFAULT NULL,
  `jars` int(11) DEFAULT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`stock_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,25,0,31,'2018-08-01 13:00:30',1),(2,26,0,8,'2018-08-01 13:01:05',1),(3,22,0,7,'2018-08-01 13:03:05',1),(4,20,0,14,'2018-08-01 13:03:42',1),(5,19,0,22,'2018-08-01 13:05:04',1),(6,23,0,20,'2018-08-01 13:10:28',1),(7,4,0,2,'2018-08-01 13:12:53',1),(8,5,0,25,'2018-08-01 13:15:37',1),(9,3,0,17,'2018-08-01 13:17:38',1),(10,11,0,15,'2018-08-01 13:18:30',1),(11,9,0,20,'2018-08-01 13:19:14',1),(12,7,0,5,'2018-08-01 13:21:18',1),(13,10,0,9,'2018-08-01 13:21:40',1),(14,6,0,30,'2018-08-01 13:22:15',1),(15,8,0,3,'2018-08-03 07:00:48',1),(16,13,0,1,'2018-08-07 16:02:24',1),(17,13,0,2,'2018-08-07 16:02:28',1),(18,14,0,1,'2018-08-07 16:02:40',1),(19,26,0,12,'2018-08-14 11:40:29',1),(20,25,0,7,'2018-08-14 11:40:45',1),(21,8,0,9,'2018-08-16 10:37:30',1),(22,25,0,16,'2018-08-17 10:40:29',1),(23,24,0,1,'2018-08-17 10:40:59',1),(24,26,0,4,'2018-08-27 06:46:37',1),(25,26,0,10,'2018-08-28 06:39:15',1),(26,6,0,5,'2018-08-29 10:30:26',1),(27,9,0,6,'2018-08-29 10:30:41',1),(28,11,0,22,'2018-08-29 10:39:21',1),(29,9,0,5,'2018-08-29 10:35:23',1);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `track` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(100) DEFAULT NULL,
  `track_url` varchar(1000) DEFAULT NULL,
  `order_no` int(11) DEFAULT NULL,
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `track`
--

LOCK TABLES `track` WRITE;
/*!40000 ALTER TABLE `track` DISABLE KEYS */;
INSERT INTO `track` VALUES (3,'The Professional Couriers','http://www.tpcglobe.com/Tracking2014.aspx?id=<trackingnumber>&type=0&service=0',0,'2018-08-22 13:22:25'),(4,'B4 Express','http://www.b4express.com/Track.aspx?AWBNo=<trackingnumber>',0,'2018-08-24 06:13:27');
/*!40000 ALTER TABLE `track` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `password` varchar(45) DEFAULT NULL,
  `address` varchar(1000) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `created_date` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'Rohit','ce59f0a12a7d','ABC XYZ','9783365925','2018-07-09 00:00:00'),(8,'akshit','ce59f0a12a7d','122 ShahpurJat','9783365925',NULL),(9,'naina','c95ef7a62d7a','Test','0',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-30 12:42:07
