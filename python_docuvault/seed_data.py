from app import app, db, User, Department, File, Comment
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import os

def create_seed_data():
    """Veritabanına örnek veriler ekler"""
    
    with app.app_context():
        # Önce tüm tabloları oluştur
        db.create_all()
        
        print("🗃️ Veritabanı tabloları oluşturuluyor...")
        
        # Departmanları oluştur
        departments_data = [
            {"name": "Kreatif", "description": "Kreatif tasarım ve içerik üretim departmanı"}
        ]
        
        departments = {}
        for dept_data in departments_data:
            existing_dept = Department.query.filter_by(name=dept_data["name"]).first()
            if not existing_dept:
                dept = Department(**dept_data)
                db.session.add(dept)
                db.session.flush()  # ID'yi almak için
                departments[dept_data["name"]] = dept
                print(f"✅ Departman oluşturuldu: {dept_data['name']}")
            else:
                departments[dept_data["name"]] = existing_dept
                print(f"⚠️ Departman zaten var: {dept_data['name']}")
        
        db.session.commit()
        
        # Kullanıcıları oluştur
        users_data = [
            {
                "username": "oğuz.akbaş",
                "email": "ali.kok@pluskitchen.com.tr",
                "password": "admin123",
                "role": "admin",
                "department": "Kreatif"
            },
            {
                "username": "eney.guney",
                "email": "eney.guney@pluskitchen.com.tr",
                "password": "user123",
                "role": "department",
                "department": "Kreatif"
            },
            {
                "username": "melisa.sunay",
                "email": "melisa.sunay@pluskitchen.com.tr",
                "password": "user123",
                "role": "department",
                "department": "Kreatif"
            },
            {
                "username": "zeynep.yigit",
                "email": "zeynep.yigit@pluskitchen.com.tr",
                "password": "user123",
                "role": "department",
                "department": "Kreatif"
            }
        ]
        
        users = {}
        for user_data in users_data:
            existing_user = User.query.filter_by(username=user_data["username"]).first()
            if not existing_user:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=generate_password_hash(user_data["password"]),
                    role=user_data["role"],
                    department_id=departments[user_data["department"]].id
                )
                db.session.add(user)
                db.session.flush()
                users[user_data["username"]] = user
                print(f"✅ Kullanıcı oluşturuldu: {user_data['username']} ({user_data['role']})")
            else:
                users[user_data["username"]] = existing_user
                print(f"⚠️ Kullanıcı zaten var: {user_data['username']}")
        
        db.session.commit()
        
        # Uploads klasöründeki gerçek dosyaları kullan
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        real_files = []
        
        if os.path.exists(uploads_dir):
            for filename in os.listdir(uploads_dir):
                file_path = os.path.join(uploads_dir, filename)
                if os.path.isfile(file_path):
                    file_size = os.path.getsize(file_path)
                    file_ext = filename.split('.')[-1].lower() if '.' in filename else 'unknown'
                    real_files.append({
                        'filename': filename,
                        'file_size': file_size,
                        'file_type': file_ext
                    })
        
        files_data = []
        
        # Gerçek dosyalar varsa onları kullan
        if real_files:
            # Dosya adlarına göre özel başlık ve açıklama oluştur
            file_metadata = {
                "1Kruvasan-2.jpg": {
                    "title": "Kruvasan Ürün Fotoğrafı",
                    "description": "Menü için kruvasan ürün görseli",
                    "status": "approved",
                    "uploaded_by": "eney.guney"
                },
                "5d7306f3-6348-41a2-b35c-6ab420e7ae39.jpg": {
                    "title": "Ürün Katalog Görseli",
                    "description": "Katalog için ürün fotoğrafı",
                    "status": "pending",
                    "uploaded_by": "melisa.sunay"
                },
                "DOF_Listesi_20250528_105045.xlsx": {
                    "title": "DOF Listesi - Mayıs 2025",
                    "description": "Departman operasyon faaliyetleri listesi",
                    "status": "approved",
                    "uploaded_by": "oğuz.akbaş"
                },
                "DOF_Rapor_department-analytics_2025-05-05.xlsx": {
                    "title": "Departman Analitik Raporu",
                    "description": "Departman performans analiz raporu",
                    "status": "approved",
                    "uploaded_by": "oğuz.akbaş"
                },
                "DOF_Rapor_status-summary_2025-04-24 (1).pdf": {
                    "title": "Durum Özet Raporu",
                    "description": "Nisan 2025 durum özet raporu",
                    "status": "approved",
                    "uploaded_by": "eney.guney"
                },
                "DOF_Raporu_20250715_163043.xlsx": {
                    "title": "DOF Detay Raporu - Temmuz",
                    "description": "Temmuz 2025 detaylı operasyon raporu",
                    "status": "pending",
                    "uploaded_by": "zeynep.yigit"
                },
                "Hisar Zam Uygulama V1.xlsx": {
                    "title": "Hisar Zam Uygulama Dosyası",
                    "description": "Fiyat artışı uygulama çalışması",
                    "status": "pending",
                    "uploaded_by": "melisa.sunay"
                },
                "Vodafone Eskalasyon Çalışması Temmuz 2025_ SON HALİ (2).xlsx": {
                    "title": "Vodafone Eskalasyon Çalışması",
                    "description": "Temmuz 2025 Vodafone eskalasyon analizi",
                    "status": "rejected",
                    "uploaded_by": "eney.guney"
                },
                "images.jpg": {
                    "title": "Genel Görsel Dosyası",
                    "description": "Proje için genel görsel materyali",
                    "status": "approved",
                    "uploaded_by": "melisa.sunay"
                },
                "pizza-ekran1.mp4": {
                    "title": "Pizza Tanıtım Videosu",
                    "description": "Pizza ürünleri tanıtım video materyali",
                    "status": "approved",
                    "uploaded_by": "zeynep.yigit"
                },
                "pk_breakfast.JPG": {
                    "title": "Kahvaltı Menü Fotoğrafı",
                    "description": "Plus Kitchen kahvaltı menüsü görseli",
                    "status": "approved",
                    "uploaded_by": "eney.guney"
                },
                "satin_alma_talebi_PR-20250419-7024.xlsx": {
                    "title": "Satın Alma Talebi",
                    "description": "PR-20250419-7024 numaralı satın alma talebi",
                    "status": "pending",
                    "uploaded_by": "oğuz.akbaş"
                }
            }
            {
                "title": "Vodafone Eskalasyon Çalışması - Temmuz 2025",
                "description": "Vodafone müşteri hizmetleri eskalasyon süreci analizi",
                "filename": "Vodafone Eskalasyon Çalışması Temmuz 2025_ SON HALİ (2).xlsx",
                "original_filename": "Vodafone Eskalasyon Çalışması Temmuz 2025_ SON HALİ (2).xlsx",
                "file_type": "xlsx",
                "file_size": 78914,
                "category": "Müşteri Hizmetleri",
                "status": "pending",
                "uploaded_by": "ayse.kaya",
                "department": "Muhasebe",
                "days_ago": 1
            },
            {
                "title": "DOF Listesi - Mayıs 2025",
                "description": "Departman operasyon faaliyetleri güncel listesi",
                "filename": "DOF_Listesi_20250528_105045.xlsx",
                "original_filename": "DOF_Listesi_20250528_105045.xlsx",
                "file_type": "xlsx",
                "file_size": 7549,
                "category": "Operasyon",
                "status": "approved",
                "uploaded_by": "ahmet.yilmaz",
                "department": "İnsan Kaynakları",
                "days_ago": 20
            },
            {
                "title": "Kahvaltı Menü Fotoğrafı",
                "description": "Plus Kitchen kahvaltı menüsü tanıtım fotoğrafı",
                "filename": "pk_breakfast.JPG",
                "original_filename": "pk_breakfast.JPG",
                "file_type": "jpg",
                "file_size": 420878,
                "category": "Menü Fotoğrafı",
                "status": "approved",
                "uploaded_by": "mehmet.demir",
                "department": "Satış",
                "days_ago": 12
            },
            {
                "title": "Satın Alma Talebi - PR-20250419-7024",
                "description": "Nisan 2025 dönemi satın alma talep formu",
                "filename": "satin_alma_talebi_PR-20250419-7024.xlsx",
                "original_filename": "satin_alma_talebi_PR-20250419-7024.xlsx",
                "file_type": "xlsx",
                "file_size": 5806,
                "category": "Satın Alma",
                "status": "approved",
                "uploaded_by": "ayse.kaya",
                "department": "Muhasebe",
                "days_ago": 25
            },
            {
                "title": "DOF Raporu - Temmuz 2025",
                "description": "Temmuz ayı departman operasyon faaliyetleri detay raporu",
                "filename": "DOF_Raporu_20250715_163043.xlsx",
                "original_filename": "DOF_Raporu_20250715_163043.xlsx",
                "file_type": "xlsx",
                "file_size": 40647,
                "category": "Aylık Rapor",
                "status": "pending",
                "uploaded_by": "fatma.ozkan",
                "department": "Üretim",
                "days_ago": 3
            }
        ]
        
        files = {}
        for file_data in files_data:
            existing_file = File.query.filter_by(filename=file_data["filename"]).first()
            if not existing_file:
                upload_date = datetime.utcnow() - timedelta(days=file_data["days_ago"])
                
                file_obj = File(
                    title=file_data["title"],
                    description=file_data["description"],
                    filename=file_data["filename"],
                    original_filename=file_data["original_filename"],
                    file_type=file_data["file_type"],
                    file_size=file_data["file_size"],
                    category=file_data["category"],
                    status=file_data["status"],
                    uploaded_by=users[file_data["uploaded_by"]].id,
                    department_id=departments[file_data["department"]].id,
                    uploaded_at=upload_date
                )
                
                # Onaylanmış veya reddedilmiş dosyalar için inceleme tarihi ekle
                if file_data["status"] in ["approved", "rejected"]:
                    file_obj.reviewed_at = upload_date + timedelta(days=1)
                    file_obj.reviewed_by = users["admin"].id
                
                db.session.add(file_obj)
                db.session.flush()
                files[file_data["filename"]] = file_obj
                print(f"✅ Dosya oluşturuldu: {file_data['title']} ({file_data['status']})")
            else:
                files[file_data["filename"]] = existing_file
                print(f"⚠️ Dosya zaten var: {file_data['title']}")
        
        db.session.commit()
        
        # Örnek yorumlar ekle
        comments_data = [
            {
                "file": "bordro_2024.pdf",
                "user": "admin",
                "content": "Bordro detayları incelendi, onaylandı. Tüm hesaplamalar doğru görünüyor.",
                "days_ago": 14
            },
            {
                "file": "logo_2024.png",
                "user": "admin", 
                "content": "Logo kalitesi çok iyi, kurumsal kimlik standartlarına uygun. Onaylandı.",
                "days_ago": 7
            },
            {
                "file": "kalite_kontrol.mp4",
                "user": "admin",
                "content": "Eğitim videosu çok açıklayıcı. Tüm çalışanlarla paylaşılabilir.",
                "days_ago": 4
            },
            {
                "file": "kalite_kontrol.mp4",
                "user": "fatma.ozkan",
                "content": "Video çekimi sırasında ses kalitesinde küçük sorunlar vardı ama genel olarak başarılı.",
                "days_ago": 4
            },
            {
                "file": "yedekleme_proseduru.docx",
                "user": "admin",
                "content": "Prosedür eksik bilgiler içeriyor. Lütfen detayları tamamlayıp tekrar yükleyin.",
                "days_ago": 9
            },
            {
                "file": "yedekleme_proseduru.docx",
                "user": "ali.celik",
                "content": "Geri bildirim için teşekkürler. Eksik bölümleri tamamlayıp yeni versiyon yükleyeceğim.",
                "days_ago": 9
            },
            {
                "file": "satis_raporu_aralik.xlsx",
                "user": "mehmet.demir",
                "content": "Rapor hazır, incelemenizi bekliyorum. Özellikle hedef karşılaştırma bölümüne dikkat çekmek isterim.",
                "days_ago": 2
            }
        ]
        
        for comment_data in comments_data:
            if comment_data["file"] in files and comment_data["user"] in users:
                comment_date = datetime.utcnow() - timedelta(days=comment_data["days_ago"])
                
                comment = Comment(
                    content=comment_data["content"],
                    file_id=files[comment_data["file"]].id,
                    user_id=users[comment_data["user"]].id,
                    created_at=comment_date
                )
                db.session.add(comment)
                print(f"✅ Yorum eklendi: {comment_data['user']} -> {comment_data['file']}")
        
        db.session.commit()
        
        print("\n🎉 Seed data başarıyla oluşturuldu!")
        print("\n📊 Özet:")
        print(f"   • {len(departments_data)} Departman")
        print(f"   • {len(users_data)} Kullanıcı")
        print(f"   • {len(files_data)} Dosya")
        print(f"   • {len(comments_data)} Yorum")
        
        print("\n🔐 Giriş Bilgileri:")
        print("   Yönetici: admin / admin123")
        print("   Departman Kullanıcıları: [kullanıcı_adı] / user123")
        print("   Örnek: ahmet.yilmaz / user123")
        
        print(f"\n📁 Veritabanı dosyası: {os.path.abspath('docuvault.db')}")

if __name__ == "__main__":
    create_seed_data()
