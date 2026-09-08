-- 커뮤니티(post/post_comment/post_like) 개발용 샘플 데이터.
-- festival.sql로 DB를 만들고 member 테이블에 계정이 있는 상태에서 이 파일을 실행하면
-- 커뮤니티 게시판이 빈 화면이 아니라 실제 글/댓글/좋아요가 있는 것처럼 보임.
-- 카테고리: REVIEW(공연후기, 앨범/굿즈 리뷰 포함), COMPANION(동행), QUESTION(질문),
--          INFORMATION(정보), EVENT(이벤트), TRANSFER(양도), FREE(자유게시판)
-- (member_id 1,2,3을 작성자로 씀 — 이미 존재하는 계정이어야 함)
--
-- 실행: mysql -u root -p festival < database/seed_community_sample_data.sql
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
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` (`post_id`, `member_id`, `category`, `title`, `content`, `image_url`, `view_count`, `created_at`, `updated_at`) VALUES (5,1,'REVIEW','NELL 콘서트 다녀왔어요 ㅠㅠ 진짜 최고','어제 예스24 라이브홀에서 넬 콘서트 보고 왔는데 앵콜까지 3시간 완전 꽉 채워서 놀랐어요. 초심 라이브로 시작할 때 진짜 소름 돋았습니다. 다음에 또 내한/단콘 하면 무조건 갈 예정!',NULL,34,'2026-08-18 21:10:00','2026-08-18 21:10:00'),(6,2,'REVIEW','태민 월드투어 서울 공연 후기 (스포 있음)','무대 연출이 진짜 미쳤습니다... 특히 2부 시작할 때 연출 보고 소리 지를 뻔. 좌석은 2층이었는데도 시야 방해 없이 잘 보였어요. 굿즈 줄은 좀 길었지만 그래도 만족스러운 공연이었습니다.',NULL,21,'2026-08-19 10:32:00','2026-08-19 10:32:00'),(7,3,'COMPANION','9/6 부산 TMA 같이 가실 분 구해요 (여자)','부산 THE FACT MUSIC AWARDS 티켓 있는데 혼자 가기 심심해서요. KTX 같이 타고 가실 분 있으면 편하게 채팅 주세요! 나이는 20대 초중반대면 좋을 것 같아요.',NULL,15,'2026-08-19 15:02:00','2026-08-19 15:02:00'),(8,1,'COMPANION','SPYAIR 내한 공연장 앞에서 같이 굿즈 줄 서주실 분','오픈런 아니고 그냥 일찍 가서 줄 서는 건데 혼자 몇 시간 기다리려니 좀 그래서요. 당일 아침 일찍 만나서 같이 기다려주실 분 구합니다.',NULL,9,'2026-08-20 09:15:00','2026-08-20 09:15:00'),(9,2,'QUESTION','예스24 라이브홀 근처 주차 어디로 하시나요?','차 가지고 가려는데 공연장 자체 주차장은 항상 만석이라고 들어서요. 근처에 시간당 요금 괜찮은 주차장 아시는 분 계신가요?',NULL,27,'2026-08-19 18:44:00','2026-08-19 18:44:00'),(10,3,'QUESTION','내한 공연 굿즈 온라인으로도 사나요?','이번에 back number 내한 공연 못 가는데 혹시 공연장 안 가도 온라인으로 MD 살 수 있는 방법 있을까요? 아시는 분 계시면 알려주세요 ㅠㅠ',NULL,14,'2026-08-20 12:20:00','2026-08-21 12:16:13'),(11,1,'INFORMATION','코첼라 2026 라인업/타임테이블 공유합니다','이번에 다녀온 사람으로서 타임테이블이랑 스테이지별 이동 팁 정리해봤어요. 특히 메인스테이지 앞자리 잡으려면 최소 2시간 전에는 가 계셔야 합니다. 필요하신 분들 참고하세요.',NULL,41,'2026-08-17 20:05:00','2026-08-17 20:05:00'),(12,2,'INFORMATION','공연 티켓 취소/환불 규정 정리 (YES24 기준)','예매 사이트마다 환불 수수료가 달라서 헷갈리시는 분들 많더라고요. YES24 기준으로 공연일 기준 며칠 전까지 몇 % 수수료 붙는지 정리해서 올려요.',NULL,33,'2026-08-18 08:40:00','2026-08-18 08:40:00'),(13,3,'FREE','다들 페스티벌 갈 때 뭐 챙겨가세요?','저는 항상 여벌 옷이랑 손풍기, 물티슈는 필수로 챙기는데 다른 분들은 또 뭐 챙기시는지 궁금하네요. 페스티벌 짐 싸기 팁 있으면 공유해주세요!',NULL,19,'2026-08-19 22:00:00','2026-08-19 22:00:00'),(14,1,'FREE','요즘 제일 많이 듣는 공연 브금(?) 뭐예요','저는 요즘 넬 노래 무한반복 중이에요. 다들 요즘 꽂힌 아티스트나 노래 있으면 추천 좀 해주세요 ㅎㅎ',NULL,10,'2026-08-20 19:30:00','2026-08-21 12:11:13'),(15,1,'EVENT','NELL 콘서트 팬사인회 응모 이벤트 떴어요!','음반 구매 인증하면 추첨으로 팬사인회 초대해준대요. 마감이 이번 주 일요일까지라 서두르셔야 할 것 같아요. 링크는 공식 SNS에서 확인 가능합니다.',NULL,22,'2026-08-19 13:00:00','2026-08-19 13:00:00'),(16,2,'EVENT','공연 후기 남기면 포토카드 증정 이벤트','이번 태민 공연 후기 인스타에 올리고 해시태그 달면 랜덤으로 포토카드 준다고 하네요. 참여 방법은 댓글로 안내드릴게요!',NULL,17,'2026-08-19 16:20:00','2026-08-19 16:20:00'),(17,3,'TRANSFER','코첼라 위켄드1 티켓 1매 양도합니다','개인 사정으로 못 가게 되어서 정가에 양도합니다. 위치는 GA 구역이고 티켓 확인 가능하신 분만 연락 주세요.',NULL,30,'2026-08-19 09:40:00','2026-08-19 09:40:00'),(18,1,'TRANSFER','태민 서울 공연 2연석 → 1매만 필요하신 분 계신가요','친구랑 2연석 예매했는데 친구가 사정이 생겨서 한 자리만 양도하려고 합니다. 좌석 정보는 쪽지로 안내드릴게요.',NULL,14,'2026-08-20 11:05:00','2026-08-20 11:05:00'),(19,2,'REVIEW','넬 새 앨범 리뷰 - 트랙별 감상평','이번 앨범 타이틀곡도 좋지만 개인적으로 3번 트랙이 제일 좋았어요. 프로듀싱 방향이 이전 앨범이랑 좀 다른 느낌인데 다들 어떻게 들으셨나요.',NULL,18,'2026-08-18 15:30:00','2026-08-18 15:30:00'),(20,3,'REVIEW','태민 콘서트 굿즈 퀄리티 후기 (postcard set)','포토카드 세트 퀄리티가 진짜 좋더라고요. 인화 질도 좋고 케이스도 튼튼해서 만족스러웠어요. 가격 대비 괜찮은 것 같습니다.',NULL,11,'2026-08-19 20:10:00','2026-08-19 20:10:00');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `post_comment`
--

LOCK TABLES `post_comment` WRITE;
/*!40000 ALTER TABLE `post_comment` DISABLE KEYS */;
INSERT INTO `post_comment` (`comment_id`, `post_id`, `member_id`, `parent_id`, `content`, `created_at`) VALUES (1,5,2,NULL,'저도 어제 갔었는데 진짜 인생 공연이었어요 ㅠㅠ','2026-08-18 22:00:00'),(2,5,3,NULL,'앵콜 몇 곡이나 했어요?? 궁금하네요','2026-08-18 22:30:00'),(3,9,1,NULL,'저는 항상 인근 공영주차장 이용해요! 도보 5분 거리라 괜찮더라고요','2026-08-19 19:10:00'),(4,11,2,NULL,'타임테이블 진짜 감사합니다 스크랩해갈게요!','2026-08-17 21:00:00'),(5,13,1,NULL,'저는 접이식 방석이랑 우비 필수로 챙겨요!','2026-08-19 22:40:00'),(6,5,1,2,'3앵콜까지 했어요! 마지막 곡 진짜 떼창이었습니다','2026-08-18 23:00:00');
/*!40000 ALTER TABLE `post_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `post_like`
--

LOCK TABLES `post_like` WRITE;
/*!40000 ALTER TABLE `post_like` DISABLE KEYS */;
INSERT INTO `post_like` (`post_like_id`, `post_id`, `member_id`, `created_at`) VALUES (1,5,2,'2026-08-18 21:40:00'),(2,5,3,'2026-08-18 22:10:00'),(3,6,1,'2026-08-19 11:00:00'),(4,11,2,'2026-08-17 20:30:00'),(5,11,3,'2026-08-17 21:15:00'),(6,12,1,'2026-08-18 09:00:00');
/*!40000 ALTER TABLE `post_like` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-21 12:18:19
