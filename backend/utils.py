import os
from werkzeug.utils import secure_filename
from datetime import datetime

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_resume(file, uid, upload_folder):
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{uid}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        return filename, filepath
    return None, None