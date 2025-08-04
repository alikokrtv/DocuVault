#!/usr/bin/env python
"""
Railway Deployment Database Initialization Script
Bu script Railway'de deploy edildiğinde veritabanını kurar ve örnek verileri ekler.
"""

import os
import sys
from datetime import datetime, timedelta

# Flask app'ı import et
from app import app, db, User, Department, File, Comment
from werkzeug.security import generate_password_hash

def init_database():
    """Veritabanını başlat ve örnek verileri ekle"""
    
    print("🗃️ Railway Veritabanı başlatılıyor...")
    
    with app.app_context():
        try:
            # Tabloları oluştur
            db.create_all()
            print("✅ Veritabanı tabloları oluşturuldu")
            
            # Eğer zaten veri varsa, tekrar ekleme
            existing_users = User.query.count()
            if existing_users > 0:
                print(f"⚠️ Veritabanında zaten {existing_users} kullanıcı var, seed data atlanıyor")
                return
            
            # Departmanları oluştur
            print("📁 Departmanlar oluşturuluyor...")
            departments_data = [
                {"name": "Kreatif", "description": "Kreatif tasarım ve içerik üretim departmanı"},
                {"name": "Muhasebe", "description": "Mali işler ve muhasebe departmanı"},
                {"name": "İnsan Kaynakları", "description": "İK ve personel işleri departmanı"},
                {"name": "Satış", "description": "Satış ve pazarlama departmanı"},
                {"name": "Üretim", "description": "Üretim ve operasyon departmanı"},
                {"name": "Genel", "description": "Genel yönetim departmanı"}
            ]
            
            departments = {}
            for dept_data in departments_data:
                dept = Department(**dept_data)
                db.session.add(dept)
                db.session.flush()
                departments[dept_data["name"]] = dept
                print(f"  ✅ {dept_data['name']}")
            
            db.session.commit()
            
            # Kullanıcıları oluştur
            print("👥 Kullanıcılar oluşturuluyor...")
            users_data = [
                {
                    "username": "admin",
                    "email": "admin@pluskitchen.com.tr", 
                    "password": "admin123",
                    "role": "admin",
                    "department": "Genel"
                },
                {
                    "username": "oğuz.akbaş",
                    "email": "oguz.akbas@pluskitchen.com.tr",
                    "password": "user123", 
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
                },
                {
                    "username": "ahmet.yilmaz",
                    "email": "ahmet.yilmaz@pluskitchen.com.tr", 
                    "password": "user123",
                    "role": "department",
                    "department": "İnsan Kaynakları"
                },
                {
                    "username": "ayse.kaya",
                    "email": "ayse.kaya@pluskitchen.com.tr",
                    "password": "user123", 
                    "role": "department",
                    "department": "Muhasebe"
                },
                {
                    "username": "mehmet.demir",
                    "email": "mehmet.demir@pluskitchen.com.tr",
                    "password": "user123",
                    "role": "department", 
                    "department": "Satış"
                },
                {
                    "username": "fatma.ozkan",
                    "email": "fatma.ozkan@pluskitchen.com.tr",
                    "password": "user123",
                    "role": "department",
                    "department": "Üretim"
                }
            ]
            
            users = {}
            for user_data in users_data:
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
                role_text = "👑 Admin" if user_data["role"] == "admin" else "👤 Kullanıcı"
                print(f"  ✅ {user_data['username']} ({role_text})")
            
            db.session.commit()
            
            # Örnek dosyalar (Railway'de gerçek dosya olmadığı için metadata olarak)
            print("📄 Örnek belgeler oluşturuluyor...")
            files_data = [
                {
                    "title": "Şirket Logosu 2025",
                    "description": "Plus Kitchen güncel kurumsal logo dosyası", 
                    "filename": "pk_logo_2025.png",
                    "original_filename": "plus_kitchen_logo_2025.png",
                    "file_type": "png",
                    "file_size": 125430,
                    "category": "Kurumsal Kimlik",
                    "status": "approved",
                    "uploaded_by": "eney.guney",
                    "department": "Kreatif",
                    "days_ago": 5
                },
                {
                    "title": "Çalışan Bordrosu - Mart 2025", 
                    "description": "Mart ayı çalışan bordro listesi",
                    "filename": "bordro_mart_2025.xlsx",
                    "original_filename": "çalışan_bordrosu_mart_2025.xlsx",
                    "file_type": "xlsx", 
                    "file_size": 45600,
                    "category": "İnsan Kaynakları",
                    "status": "approved",
                    "uploaded_by": "ahmet.yilmaz",
                    "department": "İnsan Kaynakları", 
                    "days_ago": 15
                },
                {
                    "title": "Vodafone Eskalasyon Çalışması",
                    "description": "Vodafone müşteri hizmetleri eskalasyon süreci analizi",
                    "filename": "vodafone_eskalasyon_2025.xlsx", 
                    "original_filename": "Vodafone Eskalasyon Çalışması Temmuz 2025.xlsx",
                    "file_type": "xlsx",
                    "file_size": 78914,
                    "category": "Müşteri Hizmetleri",
                    "status": "pending", 
                    "uploaded_by": "ayse.kaya",
                    "department": "Muhasebe",
                    "days_ago": 1
                },
                {
                    "title": "Kahvaltı Menü Fotoğrafı",
                    "description": "Plus Kitchen kahvaltı menüsü tanıtım fotoğrafı",
                    "filename": "pk_breakfast_menu.jpg",
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
                    "filename": "satin_alma_pr_7024.xlsx",
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
                    "title": "Üretim Raporu - Temmuz 2025",
                    "description": "Temmuz ayı üretim performans raporu",
                    "filename": "uretim_raporu_temmuz_2025.pdf",
                    "original_filename": "DOF_Raporu_20250715_163043.xlsx", 
                    "file_type": "pdf",
                    "file_size": 40647,
                    "category": "Aylık Rapor",
                    "status": "pending",
                    "uploaded_by": "fatma.ozkan",
                    "department": "Üretim",
                    "days_ago": 3
                }
            ]
            
            files = {}
            admin_user = users["admin"]
            
            for file_data in files_data:
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
                
                # Onaylanmış veya reddedilmiş dosyalar için inceleme tarihi
                if file_data["status"] in ["approved", "rejected"]:
                    file_obj.reviewed_at = upload_date + timedelta(days=1) 
                    file_obj.reviewed_by = admin_user.id
                
                db.session.add(file_obj)
                db.session.flush()
                files[file_data["filename"]] = file_obj
                status_icon = "✅" if file_data["status"] == "approved" else "⏳" if file_data["status"] == "pending" else "❌"
                print(f"  {status_icon} {file_data['title']}")
            
            db.session.commit()
            
            # Örnek yorumlar
            print("💬 Örnek yorumlar ekleniyor...")
            comments_data = [
                {
                    "file": "pk_logo_2025.png",
                    "user": "admin",
                    "content": "Logo tasarımı çok başarılı. Tüm platform ve materyallerde kullanılabilir.",
                    "days_ago": 4
                },
                {
                    "file": "pk_breakfast_menu.jpg", 
                    "user": "admin",
                    "content": "Fotoğraf kalitesi mükemmel, menü kartlarında kullanım için onaylandı.",
                    "days_ago": 11
                },
                {
                    "file": "vodafone_eskalasyon_2025.xlsx",
                    "user": "ayse.kaya",
                    "content": "Eskalasyon analizi hazır, yönetici incelemesini bekliyorum. Önemli bulgular var.",
                    "days_ago": 1
                }
            ]
            
            for comment_data in comments_data:
                # Dosyayı filename ile bul
                file_obj = None
                for f in files.values():
                    if comment_data["file"] in f.filename or comment_data["file"] in f.original_filename:
                        file_obj = f
                        break
                
                if file_obj and comment_data["user"] in users:
                    comment_date = datetime.utcnow() - timedelta(days=comment_data["days_ago"])
                    
                    comment = Comment(
                        content=comment_data["content"],
                        file_id=file_obj.id,
                        user_id=users[comment_data["user"]].id,
                        created_at=comment_date
                    )
                    db.session.add(comment)
                    print(f"  💬 {comment_data['user']} → {file_obj.title}")
            
            db.session.commit()
            
            print("\n🎉 Railway veritabanı başarıyla kuruldu!")
            print("\n📊 Özet:")
            print(f"   • {len(departments_data)} Departman")
            print(f"   • {len(users_data)} Kullanıcı") 
            print(f"   • {len(files_data)} Belge")
            print(f"   • {len(comments_data)} Yorum")
            
            print("\n🔐 Giriş Bilgileri:")
            print("   👑 Sistem Yöneticisi: admin / admin123")
            print("   👑 Kreatif Yönetici: oğuz.akbaş / user123") 
            print("   👤 Departman Kullanıcıları: [kullanıcı_adı] / user123")
            print("   📧 Örnek: eney.guney / user123")
            
            return True
            
        except Exception as e:
            print(f"❌ Hata oluştu: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)