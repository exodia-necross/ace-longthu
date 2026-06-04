insert into public.tournaments (id, name, slogan, starts_at, venue_name, address)
values ('00000000-0000-0000-0000-000000000001', 'GIẢI CẦU LÔNG ACE LÔNG THỦ', 'Nơi kết nối đam mê - Thi đấu hết mình', '2026-07-19 08:00:00+07', 'ACE Sports Center', 'Quận 7, TP. Hồ Chí Minh');

insert into public.venues (id, name, address)
values ('00000000-0000-0000-0000-000000000101', 'ACE Sports Center', 'Quận 7, TP. Hồ Chí Minh');

insert into public.courts (id, venue_id, name)
values
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Sân 1'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'Sân 2'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', 'Sân 3');

insert into public.announcements (tournament_id, title, body)
values
('00000000-0000-0000-0000-000000000001', 'Mở cổng đăng ký mùa giải 2026', 'Ban tổ chức nhận đăng ký đến 23:59 ngày 12/07/2026.'),
('00000000-0000-0000-0000-000000000001', 'Lịch thi đấu dự kiến', 'Vòng bảng bắt đầu lúc 08:00, vòng loại trực tiếp diễn ra buổi chiều.');
