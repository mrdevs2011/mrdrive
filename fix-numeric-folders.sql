-- Xato bilan "1", "2", "3"... papkalariga tushib qolgan fayllarni papkasiz holatga qaytaradi.
-- Avval faqat ko'rish (nima o'zgarishini tekshiring):
select id, filename, folder from files where folder ~ '^[0-9]+$';

-- Keyin bajaring:
update files set folder = null where folder ~ '^[0-9]+$';

-- Agar "1", "2"... nomli papkalarni o'zingiz yaratmagan bo'lsangiz, ular jadvalda bo'lsa o'chiring:
-- delete from folders where name ~ '^[0-9]+$';
