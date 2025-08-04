from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory, Response
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid
import mimetypes

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///docuvault.db'  # SQLite for simplicity, can be changed to PostgreSQL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Lütfen giriş yapın.'

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'mp4', 'docx', 'xlsx', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='department')  # 'admin' or 'department'
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    users = db.relationship('User', backref='department', lazy=True)
    files = db.relationship('File', backref='department', lazy=True)

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    category = db.Column(db.String(50))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Revision system fields
    parent_file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=True)
    version_number = db.Column(db.Integer, default=1)
    is_current_version = db.Column(db.Boolean, default=True)
    revision_notes = db.Column(db.Text)
    
    uploader = db.relationship('User', foreign_keys=[uploaded_by], backref='uploaded_files')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_files')
    comments = db.relationship('Comment', backref='file', lazy=True, cascade='all, delete-orphan')
    
    # Self-referential relationship for revisions
    parent_file = db.relationship('File', remote_side=[id], backref='revisions')
    
    def get_all_versions(self):
        """Get all versions of this file (including self)"""
        if self.parent_file_id:
            # This is a revision, get the original file's all versions
            return File.query.filter(
                (File.id == self.parent_file_id) | (File.parent_file_id == self.parent_file_id)
            ).order_by(File.version_number.desc()).all()
        else:
            # This is the original file, get all its revisions
            return File.query.filter(
                (File.id == self.id) | (File.parent_file_id == self.id)
            ).order_by(File.version_number.desc()).all()
    
    def get_latest_version(self):
        """Get the latest version of this file"""
        all_versions = self.get_all_versions()
        return all_versions[0] if all_versions else self
    
    def get_original_file(self):
        """Get the original file (version 1)"""
        if self.parent_file_id:
            return File.query.get(self.parent_file_id)
        return self

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('file.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='comments')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('admin_dashboard'))
        else:
            return redirect(url_for('department_dashboard'))
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash('Başarıyla giriş yaptınız!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Kullanıcı adı veya şifre hatalı!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Başarıyla çıkış yaptınız!', 'info')
    return redirect(url_for('index'))

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        flash('Bu sayfaya erişim yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    # Get filter parameters
    search = request.args.get('search', '')
    department_filter = request.args.get('department', '')
    status_filter = request.args.get('status', '')
    type_filter = request.args.get('type', '')
    
    # Build query
    query = File.query
    
    if search:
        query = query.filter(File.title.contains(search))
    if department_filter:
        query = query.filter(File.department_id == department_filter)
    if status_filter:
        query = query.filter(File.status == status_filter)
    if type_filter:
        query = query.filter(File.file_type == type_filter)
    
    files = query.order_by(File.uploaded_at.desc()).all()
    departments = Department.query.all()
    
    return render_template('admin_dashboard.html', 
                         files=files, 
                         departments=departments,
                         search=search,
                         department_filter=department_filter,
                         status_filter=status_filter,
                         type_filter=type_filter)

@app.route('/department/dashboard')
@login_required
def department_dashboard():
    if current_user.role != 'department':
        flash('Bu sayfaya erişim yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    files = File.query.filter_by(uploaded_by=current_user.id).order_by(File.uploaded_at.desc()).all()
    return render_template('department_dashboard.html', files=files)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload_file():
    if current_user.role != 'department':
        flash('Dosya yükleme yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        category = request.form['category']
        
        if 'file' not in request.files:
            flash('Dosya seçilmedi!', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('Dosya seçilmedi!', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Get file info
            file_size = os.path.getsize(file_path)
            file_type = file.filename.rsplit('.', 1)[1].lower()
            
            # Save to database
            new_file = File(
                title=title,
                description=description,
                filename=filename,
                original_filename=file.filename,
                file_type=file_type,
                file_size=file_size,
                category=category,
                uploaded_by=current_user.id,
                department_id=current_user.department_id
            )
            
            db.session.add(new_file)
            db.session.commit()
            
            flash('Dosya başarıyla yüklendi!', 'success')
            return redirect(url_for('department_dashboard'))
        else:
            flash('Geçersiz dosya türü!', 'error')
    
    return render_template('upload.html')

@app.route('/file/<int:file_id>')
@login_required
def view_file(file_id):
    file = File.query.get_or_404(file_id)
    
    # Check permissions
    if current_user.role != 'admin' and file.uploaded_by != current_user.id:
        flash('Bu dosyaya erişim yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    return render_template('file_detail.html', file=file)

@app.route('/file/<int:file_id>/approve', methods=['POST'])
@login_required
def approve_file(file_id):
    if current_user.role != 'admin':
        flash('Bu işlem için yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    file = File.query.get_or_404(file_id)
    file.status = 'approved'
    file.reviewed_by = current_user.id
    file.reviewed_at = datetime.utcnow()
    
    db.session.commit()
    flash('Dosya onaylandı!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/file/<int:file_id>/reject', methods=['POST'])
@login_required
def reject_file(file_id):
    if current_user.role != 'admin':
        flash('Bu işlem için yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    file = File.query.get_or_404(file_id)
    file.status = 'rejected'
    file.reviewed_by = current_user.id
    file.reviewed_at = datetime.utcnow()
    
    db.session.commit()
    flash('Dosya reddedildi!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.route('/file/<int:file_id>/comment', methods=['POST'])
@login_required
def add_comment(file_id):
    file = File.query.get_or_404(file_id)
    
    # Check permissions
    if current_user.role != 'admin' and file.uploaded_by != current_user.id:
        flash('Bu dosyaya yorum yapma yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    content = request.form['content']
    if content.strip():
        comment = Comment(
            content=content,
            file_id=file_id,
            user_id=current_user.id
        )
        db.session.add(comment)
        db.session.commit()
        flash('Yorum eklendi!', 'success')
    
    return redirect(url_for('view_file', file_id=file_id))

@app.route('/file/<int:file_id>/revise', methods=['GET', 'POST'])
@login_required
def revise_file(file_id):
    original_file = File.query.get_or_404(file_id)
    
    # Check permissions - only file owner or admin can revise
    if current_user.role != 'admin' and original_file.uploaded_by != current_user.id:
        flash('Bu dosyayı revize etme yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        category = request.form['category']
        revision_notes = request.form['revision_notes']
        
        if 'file' not in request.files:
            flash('Dosya seçilmedi!', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('Dosya seçilmedi!', 'error')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Get file info
            file_size = os.path.getsize(file_path)
            file_type = file.filename.rsplit('.', 1)[1].lower()
            
            # Get the original file (in case this is already a revision)
            original = original_file.get_original_file()
            
            # Get next version number
            all_versions = original.get_all_versions()
            next_version = max([v.version_number for v in all_versions]) + 1
            
            # Mark all previous versions as not current
            for version in all_versions:
                version.is_current_version = False
            
            # Create new revision
            new_revision = File(
                title=title,
                description=description,
                filename=filename,
                original_filename=file.filename,
                file_type=file_type,
                file_size=file_size,
                category=category,
                uploaded_by=current_user.id,
                department_id=current_user.department_id,
                parent_file_id=original.id,
                version_number=next_version,
                is_current_version=True,
                revision_notes=revision_notes,
                status='pending'  # New revisions need approval
            )
            
            db.session.add(new_revision)
            db.session.commit()
            
            flash(f'Belge başarıyla revize edildi! (Versiyon {next_version})', 'success')
            return redirect(url_for('view_file', file_id=new_revision.id))
        else:
            flash('Geçersiz dosya türü!', 'error')
    
    return render_template('revise_file.html', file=original_file)

@app.route('/file/<int:file_id>/versions')
@login_required
def file_versions(file_id):
    file = File.query.get_or_404(file_id)
    
    # Check permissions
    if current_user.role != 'admin' and file.uploaded_by != current_user.id:
        flash('Bu dosyanın versiyonlarını görme yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    all_versions = file.get_all_versions()
    return render_template('file_versions.html', file=file, versions=all_versions)

@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    """Serve uploaded files with proper permissions"""
    # Find the file in database to check permissions
    file_record = File.query.filter_by(filename=filename).first()
    if not file_record:
        flash('Dosya bulunamadı!', 'error')
        return redirect(url_for('index'))
    
    # Check permissions
    if current_user.role != 'admin' and file_record.uploaded_by != current_user.id:
        flash('Bu dosyaya erişim yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/file/<int:file_id>/preview')
@login_required
def preview_file(file_id):
    """Preview file in browser without downloading"""
    file = File.query.get_or_404(file_id)
    
    # Check permissions
    if current_user.role != 'admin' and file.uploaded_by != current_user.id:
        flash('Bu dosyaya erişim yetkiniz yok!', 'error')
        return redirect(url_for('index'))
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    if not os.path.exists(file_path):
        flash('Dosya bulunamadı!', 'error')
        return redirect(url_for('view_file', file_id=file_id))
    
    # Get MIME type
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = 'application/octet-stream'
    
    # For certain file types, force inline display
    if file.file_type.lower() in ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt']:
        def generate():
            with open(file_path, 'rb') as f:
                while True:
                    data = f.read(4096)
                    if not data:
                        break
                    yield data
        
        response = Response(generate(), mimetype=mime_type)
        response.headers['Content-Disposition'] = f'inline; filename="{file.original_filename}"'
        return response
    else:
        # For other file types, still try to display inline if possible
        return send_from_directory(
            app.config['UPLOAD_FOLDER'], 
            file.filename,
            as_attachment=False,
            download_name=file.original_filename,
            mimetype=mime_type
        )

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            # Create default department
            default_dept = Department(name='Genel', description='Genel departman')
            db.session.add(default_dept)
            db.session.commit()
            
            admin = User(
                username='admin',
                email='admin@pluskitchen.com',
                password_hash=generate_password_hash('admin123'),
                role='admin',
                department_id=default_dept.id
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin kullanıcısı oluşturuldu: admin/admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
