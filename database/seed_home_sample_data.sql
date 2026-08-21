-- 홈 화면(공연일정/뉴스) 개발용 샘플 데이터.
-- festival.sql로 DB를 새로 만든 다음 이 파일을 실행하면
-- 다른 팀원 로컬에서도 홈 화면/공연일정/뉴스가 빈 화면이 아니라
-- 실제 데이터가 있는 것처럼 보임 (venue -> artist -> event -> event_news 순으로 넣어야 함).
--
-- 실행: mysql -u root -p festival < database/seed_home_sample_data.sql
--
-- 맨 아래 member_event(찜) 데이터는 공연일정 "인기순" 정렬이 실제로 동작하는 걸
-- 눈으로 보여주기 위한 더미 데이터 (후지록 페스티벌을 1등으로 만들어둠).
-- member_id 1,2,3이 이미 존재해야 들어감 (FK) — 없으면 그 블록만 본인 DB에 있는
-- 실제 member_id로 바꿔서 넣으면 됨.
--
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: festival
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `venue`
--

LOCK TABLES `venue` WRITE;
/*!40000 ALTER TABLE `venue` DISABLE KEYS */;
INSERT INTO `venue` (`venue_id`, `name`, `address`, `latitude`, `longitude`, `capacity`, `created_at`, `country`) VALUES (1,'YES24 LIVE HALL','서울 광진구 구천면로 20',NULL,NULL,NULL,'2026-08-20 18:19:57','KR'),(2,'킨텍스 제2전시장 후면광장','경기 고양시 일산서구 킨텍스로 217-59',NULL,NULL,NULL,'2026-08-20 19:19:51','KR'),(3,'잠실실내체육관','서울 송파구 올림픽로 25',NULL,NULL,NULL,'2026-08-20 19:19:51','KR'),(4,'예스24 원더로크홀','서울 광진구 능동로 110',NULL,NULL,NULL,'2026-08-20 19:19:51','KR'),(5,'부산아시아드주경기장','부산 연제구 아시아드대로 296',NULL,NULL,NULL,'2026-08-20 19:19:51','KR'),(6,'Empire Polo Club','Indio, California, USA',NULL,NULL,NULL,'2026-08-20 21:00:00','US'),(7,'킨텍스 제2전시장 9홀','경기 고양시 일산서구 킨텍스로 217-59',NULL,NULL,NULL,'2026-08-20 21:04:03','KR'),(8,'장충체육관','서울 중구 동호로 241',NULL,NULL,NULL,'2026-08-20 21:04:03','KR'),(9,'Naeba Ski Resort','Yuzawa, Niigata, Japan',NULL,NULL,NULL,'2026-08-20 21:04:03','JP');
/*!40000 ALTER TABLE `venue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `artist`
--

LOCK TABLES `artist` WRITE;
/*!40000 ALTER TABLE `artist` DISABLE KEYS */;
INSERT INTO `artist` (`artist_id`, `name`, `artist_type`, `profile_image`, `debut_date`, `description`, `created_at`, `updated_at`) VALUES (1,'넬','BAND','https://tkfile.yes24.com/upload2/perfblog/202607/20260720/20260720-59323.jpg',NULL,NULL,'2026-08-20 20:16:42','2026-08-20 20:21:39'),(2,'태민','SOLO','https://tkfile.yes24.com/upload2/perfblog/202608/20260807/20260807-59646_1.jpg',NULL,NULL,'2026-08-20 20:16:42','2026-08-20 20:21:39'),(3,'아이유','SOLO',NULL,NULL,NULL,'2026-08-20 20:16:42','2026-08-20 20:16:42'),(4,'SPYAIR','BAND',NULL,NULL,NULL,'2026-08-20 20:16:42','2026-08-20 20:16:42');
/*!40000 ALTER TABLE `artist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` (`event_id`, `venue_id`, `event_type`, `artist_country`, `name`, `description`, `poster_image`, `start_date`, `end_date`, `ticket_open_at`, `ticket_url`, `status`, `created_at`, `updated_at`) VALUES (1,1,'CONCERT','KR','NELL\'S SEASON 2026 [Only One]','넬(NELL)의 단독 콘서트, SEASON 2026 [Only One]입니다.','https://tkfile.yes24.com/upload2/perfblog/202607/20260720/20260720-59323.jpg','2026-08-29','2026-08-29',NULL,'https://ticket.yes24.com/Perf/59323','UPCOMING','2026-08-20 18:19:57','2026-08-20 18:42:20'),(2,2,'CONCERT','JP','SPYAIR JUST LIKE THIS 2026 in KOREA','SPYAIR 내한공연입니다.','https://tkfile.yes24.com/upload2/perfblog/202605/20260522/20260522-58592.jpg','2026-08-31','2026-08-31',NULL,'https://ticket.yes24.com/Perf/58592','UPCOMING','2026-08-20 19:19:51','2026-08-20 21:01:59'),(3,3,'CONCERT','KR','2026-27 TAEMIN WORLD TOUR [LiMiNaL] in SEOUL','태민 월드투어 서울 공연입니다.','https://tkfile.yes24.com/upload2/perfblog/202608/20260807/20260807-59646_1.jpg','2026-09-05','2026-09-05',NULL,'https://ticket.yes24.com/Perf/59646','UPCOMING','2026-08-20 19:19:51','2026-08-20 19:19:51'),(4,4,'FESTIVAL','KR','TETRAPOD\'26 - Intermingle','TETRAPOD 페스티벌입니다.','https://tkfile.yes24.com/upload2/perfblog/202607/20260720/20260720-59337.jpg','2026-08-30','2026-08-30',NULL,'https://ticket.yes24.com/Perf/59337','UPCOMING','2026-08-20 19:19:51','2026-08-20 19:19:51'),(5,5,'FESTIVAL','KR','2026 THE FACT MUSIC AWARDS (Busan)','TMA 부산 시상식입니다.','https://tkfile.yes24.com/upload2/perfblog/202608/20260804/20260804-59564.jpg','2026-09-06','2026-09-06',NULL,'https://ticket.yes24.com/Perf/59564','UPCOMING','2026-08-20 19:19:51','2026-08-20 19:19:51'),(6,6,'FESTIVAL','KR','Coachella 2026','Coachella Valley Music and Arts Festival 2026, Weekend 1','https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Coachella_2026_lineup.jpg/250px-Coachella_2026_lineup.jpg','2026-04-10','2026-04-12',NULL,'https://www.coachella.com/','UPCOMING','2026-08-20 21:00:00','2026-08-20 21:04:03'),(7,7,'CONCERT','JP','back number Grateful Yesterdays Tour 2026 in Seoul','back number 내한공연입니다.','https://stkfile.yes24.com/upload2/PerfBlog/202604/20260416/20260416-58079.jpg','2026-09-12','2026-09-13',NULL,'https://m.ticket.yes24.com/Notice/Detail.aspx?bid=17720','UPCOMING','2026-08-20 21:04:03','2026-08-20 21:04:03'),(8,8,'CONCERT','JP','Ryosuke Yamada ASIA TOUR 2026 Red.Y in Seoul','야마다 료스케 내한공연입니다.','https://tkfile.yes24.com/upload2/PerfBlog/202606/20260608/20260608-58751.jpg','2026-09-13','2026-09-13',NULL,'https://m.ticket.yes24.com/Perf/58751','UPCOMING','2026-08-20 21:04:03','2026-08-20 21:04:03'),(9,9,'FESTIVAL','JP','Fuji Rock Festival 2026','Naeba Ski Resort, Niigata, Japan에서 열리는 록 페스티벌입니다.','https://cdn.fujirockfestival.com/smash/top/LAghwIPjnONmQ63jB629WPK9l8Oc4mtSbxvZcgrc.jpg','2026-07-24','2026-07-26',NULL,'https://en.fujirockfestival.com/','UPCOMING','2026-08-20 21:04:03','2026-08-20 21:04:03');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `event_news`
--

LOCK TABLES `event_news` WRITE;
/*!40000 ALTER TABLE `event_news` DISABLE KEYS */;
INSERT INTO `event_news` (`news_id`, `event_id`, `artist_id`, `title`, `content`, `news_type`, `image_url`, `source_url`, `created_at`, `updated_at`) VALUES (1,NULL,NULL,'넬(NELL), 새 싱글 발표 소식',NULL,'ARTIST','https://tkfile.yes24.com/upload2/perfblog/202607/20260720/20260720-59323.jpg','https://m.ddaily.co.kr/page/view/2026041009545113347','2026-08-20 20:37:33','2026-08-20 20:43:14'),(2,NULL,NULL,'NELL SEASON 2026 [Only One] 티켓 오픈 안내',NULL,'NOTICE','https://tkfile.yes24.com/upload2/perfblog/202607/20260720/20260720-59323.jpg','https://www.heraldmuse.com/article/10813302','2026-08-20 20:37:33','2026-08-20 20:43:14'),(3,NULL,NULL,'태민 월드투어 서울 공연 라인업 공개',NULL,'LINEUP','https://tkfile.yes24.com/upload2/perfblog/202608/20260807/20260807-59646_1.jpg','https://www.etoday.co.kr/news/view/2608201','2026-08-20 20:37:33','2026-08-20 20:43:14'),(4,NULL,NULL,'SPYAIR 내한공연 공식 MD 발표',NULL,'MD','https://tkfile.yes24.com/upload2/perfblog/202605/20260522/20260522-58592.jpg','https://news.nate.com/view/20260526n10774','2026-08-20 20:37:33','2026-08-20 20:43:14'),(5,NULL,NULL,'2026 THE FACT MUSIC AWARDS 부산 개최 공지',NULL,'NOTICE','https://tkfile.yes24.com/upload2/perfblog/202608/20260804/20260804-59564.jpg','https://news.tf.co.kr/read/entertain/2331510.htm','2026-08-20 20:37:33','2026-08-20 20:43:14');
/*!40000 ALTER TABLE `event_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `member_event` (인기순 정렬용 더미 찜 데이터 — 후지록 페스티벌 1등)
--

LOCK TABLES `member_event` WRITE;
INSERT INTO `member_event` (`member_id`, `event_id`, `status`, `created_at`) VALUES
(1,9,'INTERESTED',NOW()),(2,9,'INTERESTED',NOW()),(3,9,'INTERESTED',NOW());
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-21 10:05:05
