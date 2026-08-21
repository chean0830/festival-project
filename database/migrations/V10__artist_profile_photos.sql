USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- V9에서 이름/타입만 채워뒀던 아티스트들 중 프로필 사진을 찾은 만큼 채운다.
-- 출처: 나무위키(K-pop/J-rock 다수) + 위키미디어 커먼즈(서구권 아티스트 다수, 2026-08-21 조사).
-- 못 찾은 건(RIIZE는 그룹샷 없이 멤버 개인샷만 있음, KiiiKiii/tripleS/PinkPantheress는
-- 로고·앨범아트만 있음, IDID/Disclosure/Hi-Standard/TETRAPOD 서브 DJ 9팀은 신뢰할 만한 사진을
-- 못 찾음) 그대로 NULL로 남겨뒀다.

UPDATE artist SET profile_image = 'https://i.namu.wiki/i/SkDxVYxLHm3HMolxJQmtvPrujLnkhRgaO021m6QeVKuXemAkEcsRrxa6fHCoptV5Iqj3_ukE83j5J62l4xIiVMpLJQYT5rOURi1X_bMbkE4hpD_ZoR7BMwH5ymlaLfzcrTlPDNyl2Rlu-frunBIh2g.webp' WHERE name = 'ATEEZ';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/ISFsVimbXxnlAJX2oUk8dzUfNre04gxlMFEYMJ6ZVmBxepANhrep0NVydu5T-4GcI_qWgmesz8QrJSUFPuq3dQXlhvaTz_N26d9uevO4rRpvfukK4kbuWNgRScfZvwDhqqpYzwgIWmvarjakuvl9sg.webp' WHERE name = 'TREASURE';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/TfR0ViUx-aYrDEXuZg0Q_E_CDr2EE5QjSwKwk-NJLQjQb7kWhGmBZbN4Y7JKt7H8e6vYte1G-gvUgA-QUEfwYFmzqEMhz1EJo4RYHZrRIocPAjMrOGoHSJwvY2W_7hJ-u8EBr0MJDwf7JRWxDBT80A.webp' WHERE name = 'ILLIT';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/mTMPHWEWobuL3RuxZ6v74NWEFJT2dvhUBTulQ8L2LjMFk6cauDw2SY18MV9g8iv0ezJFu-0MLzQEB0FBMvGCWjlUCZRB81XeevF2Oy3k875YuKZ6Nrkc9H4-J4on8ny8_ziH3r5sOt483SG7EAsqzQ.webp' WHERE name = 'NMIXX';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/UiqtnP38Gaj7AHxQRWXeE6glGK-I0JSritGsDGmvLFN1LmrgfM3T-8VSw7KXzT_eM0E9lmLB8ukJ42kgpOEReIDoUnQeiSUewJXYkXd5yG6k1mfZmWVlYhax7hZ9-rlfM45Zagjpl-YjhFWNARPXbA.webp' WHERE name = 'ALLDAY PROJECT';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/DyZTEm6dabREDGhBL4y76-wIJrHsx1dMYENYfQ1OeDVXELxOh8egD_95h6K54ddhKDLgAGt3IZnbr762sjNEYsv3lDORqBxo0rRnioDdQQ9Sjh8PLYOn-X6ziyOXaPlH2Wu07D1WJxDO6jKLR6uYYA.webp' WHERE name = 'CORTIS';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/4wLF7bSbje6RgrQCdH1d4JykV2yGilHQ6ohRAw7lYbe08VPAjJi0UXLDHBzs8aN_sdoYNRHVM17MbnWFqAWKHj36dQp59TGkBSNIajYJ3g4_GQGgv-B5HMS4mXKPE_Ew-ZLkgQUccHpaA.webp' WHERE name = 'xikers';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/nkuyienmujI4PuQw3_bGlZzj13O9ScVzbhoF86pif3sD27IqyH0YfXRY29fOGy9gv0PbysSqJRDMrANlh_n6i3YBdTmpdQLJhcZNir4hjp6dzGiBkiu0owFkvJiJt4CI90xntHOs7pc0ztsw6Zlkug.webp' WHERE name = 'RESCENE';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/Fs8491BVZ9Tlu_KmcCjvE88Qli7WWh0QWvB3X8X1q-g4U9OeuC1oLEkjh2JSO75GwPq1P7V62THSL_2F_rANICwtxjE7DWcUIkDVJDcSZmqnzKwTFfW9swnCThWwY5drYDM8pfNbV1HbRAm1mUQHvg.webp' WHERE name = 'ALPHA DRIVE ONE';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/kt8nl2UVg5u2di2Bn6sioQ0TRkUitGBUDNxlodLoTWMaq6nGKaXLz5di1xMdRZxHig5FNuGL244MsUNyNr__p4uDoRQ1AeGEJiucw_h0XpPw-PlEXsIteHF35UGqAEQwsPXtziHRQudRaaz_OWWSxQ.webp' WHERE name = '임영웅';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/CrpHAkGJcEZaX47N0Mwy_ONZV9cjDfjNMJFVLAgZc2cIb4rDc3DVATcBkhO1oBq8h0LLnIOlFJA3btFVfnmpRl4DIhU5e-ISCrVLvj3ZiIMLCQx_lVWdupUh9lcZaEXq7GvQbFHJZReek0idXOIOxg.webp' WHERE name = 'Yena';
-- Evan: 나무위키 EVAN(2001) 문서 매칭 — 동명이인 있어서 확신도는 낮음
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/tdZ4d7XQ5KGH42M88yEbhIRnF0YbNcZ4EAi58dxlC9GdWFLowqr6ibboTREdFpm-Yw-dQZ00wV6mMGeYpfxWoq8I8BBRNsq7wzvLJ03YT4TvIjImnMHuFTJinQO1Z0tYiGdXwENjKYC9_OHQ0z7R2Q.webp' WHERE name = 'Evan';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/P450vmm7Ak2JstOhEXjoyCgiH84VOqCuPGqqc1TxGmPEMoFkI0QWr36rQeZ1xrVbSzrt6SBzdASoxkSYawxM4xnRBmjCnJh9-Ct7sm_zOZeg5VLYaSGi9xTGnI2TcqtSvIXjih4UhK5Jru5ecM-4fg.webp' WHERE name = 'Katseye';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/ANqok3Q0w8D4fT8BOtcShL2NWb3nqD3hw_j4Sy4JB2egtBffVKdZJFgKexgPatrIgq7ZE3YrYjYtxiT29n3zPdGNE2IEKBWT8xOajJVKf_sLbojbugG5kLDxFFc4ZFpigP_Nd7Mh0CY5LOqhSth3bA.webp' WHERE name = 'back number';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/niiQ-cmmeO7t_lupVSi_bqd-h8rI-t3oU6A5l8Qln5f8CENR2_QEB0hGCN9zMvzSEsoWPFT3qWJbLxhH5XCCjL_tRTCDY2GspXRw3o3c205mBnaMPkOjkc0JcvYX1_k8tEs0g_LWVDOx8ABVGdCmLg.webp' WHERE name = 'SPYAIR';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/v1o-oJLU_9Lqr7e5UYy5T6cz9iebw082TD-EtTpKikuo4ZlF7ylgKE0d7BSI75Ty6oFa-Zq_mBWsm2Zjf6ps-yixAg-2LXILC19C_CGVrGiHkxlRC63DXjcushj9-MPKhZKe2otw02fXcqMu_0JnyA.webp' WHERE name = 'XG';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/wgS75p-HYz1qC7XXT4FvXs78KOobjtKZzhHEkcz8Bz4Xd55m6mHhQIZdcRceKQ0WBUDb1n_D4Tn1ykEIYcSmztGTKiIvHI-E28aKyJm0GoqgKQXNiujyN6FpOZ5TZYvk3eEQVgkfJ6nKQKXmoQyL1g.webp' WHERE name = 'Asian Kung-Fu Generation';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/ZW_zmOlZvrjIPcz2zW7GwQb0Jo-x6nVivE_3uP8zRz8gQvq7cSJLxmTRDmIh334TImZRivVMMsU7cHh0ZWTndqISN2001MmydY2K2dYTKe6MdaOHfpa_mgCW5JfPv-H5qdug7sHKpheefHgKol5KKg.webp' WHERE name = 'Kaze Fujii';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/RmOi2CcYN3MLaKTOLqELmZnnOK-GSD0R0fPghDx7bQA8sbF61JuFFdZR9B4y-bDD4RDfNZvYDNQAUxmk6RfbjF33HNsXQJOepiwnFa4J4bBOLHXjUEo_zHDRuBT1-gyFKFHLyqElCUyp8zMvrcfYcg.webp' WHERE name = 'Sunny Day Service';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/xaRHd_cIloMqMcX19anE8jI4HEk-2lIJ4jybI8HGuvVeON0VNowZwiMezmXd7IpuIuRdRavKkFM_uE7_lkyYhilpfB0m1jgi1klHNvwLtxF0AfCkxbY6Rd-9wY1uBAJXZejYpJyrBfw9qTUbnzVRSw.webp' WHERE name = 'Susumu Hirasawa';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/elxTiOKHkfFqxS7369W_gIZOlOBtr9q-u1pzT2qvm_7SxUZxn9fcw60UrytApwmSb0b2c3tc3MojEQDZ7pv0WXAZPcHtJcwco-wpsIyem6Fg91AHncDWq3Hgz9NeiUAc15myzOLedkBcAuNc8S4rXw.webp' WHERE name = 'Central Cee';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/2O5N0VZcy5H0ChIcFH7Jb8r_HMS2EbenmVNpxi3ri1OHPM1iL6btSZIECAfAnBadbR4SjDH_1vQMsw8H7-SXCz3uzgaeqX525xJJFrl__zSlLmkjL024Hn_uNLmo36mrShP-mxEwXp3CiFkQv4jJ0w.webp' WHERE name = 'Sombr';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/ZHWsaEVMmOu1fF1D0hL-fXBrbAcE-MU1fe1cRLCLrm-NxQ_cj4GWPr1CKnaCjLtWqetQ1W_0eq6cIlcDr0k-gqaT2lCLoRHcy0Y8iKNiK1aEOarQyv1WVjZ4-YT8BidhLVNAYmjs4YLQSgmwoCjN0Q.webp' WHERE name = 'Addison Rae';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/K5h5hIFHR16Ds1aXn24hq-PUyigRCzjSxw64qnFx1kChABqEAcS9T_akzrh-cp0ykgtLo6ePu_e0d64TlkFQmg.webp' WHERE name = 'Laufey';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/jYJIxh7zH7pxEQlK5leEiO2oP5dxO3cnaVS5F2qyS5aCIz-H308dJejARTOdQoKBtQl_T7iYPzGXnoxvHVGBoDTGUyQNB9IinfALaEmhv0NnFsdoWI_rdyWe4wLbVyt_sW1mzTY6DQ_jkM4_BDnfpw.webp' WHERE name = 'Teddy Swims';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/F3hXOKaM2EMJrJ6aUCq3s3zKz58T7TXMXHyY2UQWhKsm0AqU2jT8-vJD6ACOmbCyYR_U11Ucrn4VESATS4E5BIKVCWx4B0HnO9SgGJgYLocgbN4UL02PUt8Zj6EyRfPu-1zdbOiQht3mbl6KWyCnGA.webp' WHERE name = 'Young Thug';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/oRGtDginDtnQbF6T2ikuzEJk8ikSl0R8t3XPuSg6BcrLYCkUzzLuQUco8V6S9PDSg77ZRCoFnyghTvE3jaoMa10waq6K-qYIHHDH3Gdsc0nDtf0CuWTlAB9iPGmzeaHR5Fmh-eIv3o1HXxJQuH_5MA.webp' WHERE name = 'Anyma';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/snPHCg0G16QFJGTlNEkz8ll7ZrqNtIeei8itVIdliQo_orYqMZWkfZQ4Egm1Ef6eHFY_WTSgx0mKpBxdWreUgip74_t4Wr1cn6MN3zYE_gbVNCeBd5VvNHgLCRPTChEfgpV-DOUV0qW-Bnh1W5YzLA.webp' WHERE name = 'Kaskade';
UPDATE artist SET profile_image = 'https://i.namu.wiki/i/sQhqVCLCScooUn08pxTn4-M4Vchr6p80dVgc8gUMhuXagGNCGkFnoX_IUCrWBeFyZNKZCA-f37VhSueeQz0ZciLdAPpeT2UNS6d0qvmvLFV-urWgbmZ9Ek7WgLefA8s6puWzUnuHlzbiGNpOq-vDGQ.webp' WHERE name = 'Sexyy Red';

-- 서구권 아티스트: 위키미디어 커먼즈
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/THE_XX.jpg' WHERE name = 'The xx';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/Khruangbin_APEVicPark270518-14_(27746142217).jpg' WHERE name = 'Khruangbin';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/Massive_Attack_007.jpg' WHERE name = 'Massive Attack';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/FKA_twigs_(16391770926)_(cropped).jpg' WHERE name = 'FKA Twigs';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/Iggy_Pop_(3).jpg' WHERE name = 'Iggy Pop';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/David_Byrne_San_Diego.jpg' WHERE name = 'David Byrne';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Strokes.jpg' WHERE name = 'The Strokes';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/Devo.JPG' WHERE name = 'Devo';
UPDATE artist SET profile_image = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ethel_Cain_at_Gunnersbury_Park_(2023-08-20)_03.jpg' WHERE name = 'Ethel Cain';
