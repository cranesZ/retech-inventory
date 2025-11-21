# Retech Inventory Backend

Production-grade REST API for the Retech Inventory Management System, built with Node.js, Express, and Supabase.

## 🚀 Features

- **RESTful API** for device inventory management
- **Supabase Integration** for PostgreSQL database and file storage
- **Optimized File Storage** with image compression and CDN delivery
- **Secure API** with CORS, Helmet, and environment-based configuration
- **Efficient Data Handling** for images, PDFs, and text data

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   └── devicesController.js # Device CRUD + file upload logic
│   ├── middleware/
│   │   └── upload.js             # Multer file upload middleware
│   ├── routes/
│   │   └── devices.js            # API route definitions
│   ├── utils/
│   │   └── imageProcessor.js     # Sharp image optimization
│   └── server.js                 # Express server entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env                          # Environment variables (DO NOT COMMIT!)
├── .env.example                  # Template for environment variables
├── package.json
└── README.md
```

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (already done for you):

```env
# Supabase Configuration
SUPABASE_URL=https://dnbagfqilkxtzpefatpv.supabase.co
SUPABASE_ANON_KEY=sb_publishable_kGXzVCmL_7DGgSR-AEH58Q_3csFAaWA

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_DOC_TYPES=application/pdf
```

⚠️ **IMPORTANT**: Never commit `.env` to version control. It contains sensitive credentials.

### 3. Create Supabase Storage Buckets

Since we're using the anon key (not service role), buckets must be created manually:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/dnbagfqilkxtzpefatpv/storage/buckets)
2. Click **"New bucket"**
3. Create these buckets:

| Bucket Name      | Public | Purpose                           |
|------------------|--------|-----------------------------------|
| `device-images`  | ✅ Yes | Device photos (optimized WebP)    |
| `documents`      | ❌ No  | Private PDF documents             |
| `invoices`       | ❌ No  | Generated invoice PDFs            |

**Bucket Settings:**
- **File size limit**: 10 MB
- **Allowed MIME types**:
  - `device-images`: `image/jpeg`, `image/png`, `image/webp`
  - `documents` & `invoices`: `application/pdf`

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
╔════════════════════════════════════════════════╗
║   Retech Inventory Backend Server Started     ║
╚════════════════════════════════════════════════╝

✅ Server running on port 3001
🌍 Environment: development
🔗 Health check: http://localhost:3001/health
📡 API endpoint: http://localhost:3001/api
🗄️  Supabase URL: https://dnbagfqilkxtzpefatpv.supabase.co

Ready to accept requests! 🚀
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Devices API

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/devices`                | Get all devices (paginated)    |
| GET    | `/api/devices/:id`            | Get device by ID               |
| POST   | `/api/devices`                | Create new device              |
| PUT    | `/api/devices/:id`            | Update device                  |
| DELETE | `/api/devices/:id`            | Delete device                  |
| POST   | `/api/devices/:id/image`      | Upload device image            |
| POST   | `/api/devices/:id/document`   | Upload device PDF              |

### Query Parameters (GET /api/devices)

- `page` (default: 1) - Page number
- `limit` (default: 50) - Items per page
- `search` - Search IMEI, model, or manufacturer
- `status` - Filter by device status
- `manufacturer` - Filter by manufacturer

### Example Requests

**Get all devices:**
```bash
curl http://localhost:3001/api/devices
```

**Search devices:**
```bash
curl "http://localhost:3001/api/devices?search=iPhone&status=IN_STOCK"
```

**Create device:**
```bash
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturer": "Apple",
    "model": "iPhone 15 Pro",
    "variant": "256GB",
    "imei": "123456789012345",
    "network": "Unlocked",
    "capacity": "256GB",
    "color": "Natural Titanium",
    "grade": "A",
    "quantity": 1,
    "price_paid": 899.99,
    "status": "Warranty Expired"
  }'
```

**Upload device image:**
```bash
curl -X POST http://localhost:3001/api/devices/{device-id}/image \
  -F "image=@/path/to/photo.jpg"
```

## 🗄️ Data Storage Architecture

### Efficient Storage Patterns

#### 1. **Text Data** (Structured)
- **Storage**: PostgreSQL tables via Supabase
- **Why**: Fast queries, indexing, transactions, relationships
- **Best For**: Device metadata, customer info, invoices, orders

#### 2. **Images** (Device Photos)
- **Storage**: Supabase Storage (S3-compatible)
- **Processing**:
  - Optimized with Sharp (resize, compress)
  - Converted to WebP (70-80% smaller than JPEG)
  - Max dimensions: 1920x1920px
  - Quality: 85%
- **Delivery**: CDN URLs for fast loading
- **Database**: Store only the `image_url`, not the file itself

**Example:**
```json
{
  "id": "uuid",
  "manufacturer": "Apple",
  "model": "iPhone 15 Pro",
  "image_url": "https://dnbagfqilkxtzpefatpv.supabase.co/storage/v1/object/public/device-images/abc123.webp"
}
```

#### 3. **PDFs** (Documents, Invoices)
- **Storage**: Supabase Storage (private buckets)
- **Processing**: None (keep original)
- **Access**: Signed URLs for secure downloads
- **Database**: Store `pdf_url`

#### 4. **Large Files** (Future: Videos, Bulk Exports)
- **Storage**: Supabase Storage or external CDN
- **Strategy**: Lazy loading, pagination
- **Compression**: Pre-compress before upload

### Why This Approach?

✅ **Scalability**: Supabase Storage scales to petabytes
✅ **Performance**: CDN delivers files globally with low latency
✅ **Cost-Effective**: Pay only for storage used (~$0.021/GB)
✅ **Reliability**: Built-in backups and replication
✅ **Security**: Row-level security policies, signed URLs

### Storage Best Practices

1. **Always optimize images** before upload
   - Reduces storage costs
   - Faster load times
   - Better user experience

2. **Use public buckets only for non-sensitive images**
   - Device photos: Public ✅
   - Invoices, contracts: Private ❌

3. **Clean up orphaned files** when deleting records
   - Implemented in `deleteDevice()` controller

4. **Set reasonable file size limits**
   - Images: 10MB (enforced by multer)
   - PDFs: 10MB

5. **Store metadata in database**
   - File size, format, upload date
   - Enables search and filtering

## 🔒 Security

### API Key Storage
- ✅ Stored in `.env` (never committed to Git)
- ✅ `.gitignore` prevents accidental commits
- ✅ Use `.env.example` for onboarding new developers

### CORS Protection
- Only allows requests from whitelisted origins
- Desktop app: `http://localhost:5173`
- Configure in `.env`: `ALLOWED_ORIGINS`

### Helmet Security Headers
- Prevents common web vulnerabilities
- XSS protection
- Content Security Policy
- HSTS enforcement

### Input Validation
- File type validation (whitelist)
- File size limits
- IMEI uniqueness checks
- SQL injection prevention (Supabase handles this)

## 🧪 Testing

Test the API manually:

```bash
# Health check
curl http://localhost:3001/health

# Get devices
curl http://localhost:3001/api/devices

# Create test device
curl -X POST http://localhost:3001/api/devices \
  -H "Content-Type: application/json" \
  -d '{"manufacturer":"Apple","model":"iPhone 15","imei":"123456789012345"}'
```

## 🔗 Connecting Desktop App

Update the desktop app to use the backend:

**desktop/.env:**
```env
VITE_API_URL=http://localhost:3001/api
```

**Example API call from desktop:**
```typescript
// desktop/src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchDevices() {
  const response = await fetch(`${API_URL}/devices`);
  const result = await response.json();
  return result.data;
}

export async function createDevice(device) {
  const response = await fetch(`${API_URL}/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device)
  });
  return response.json();
}
```

## 📊 Monitoring

View logs in the terminal:
```
2025-11-21T06:54:12.134Z - GET /health
2025-11-21T06:54:15.456Z - GET /api/devices
2025-11-21T06:54:18.789Z - POST /api/devices
```

## 🚀 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://dnbagfqilkxtzpefatpv.supabase.co
SUPABASE_ANON_KEY=your-production-key
ALLOWED_ORIGINS=https://your-production-domain.com
```

### Recommended Hosting
- **Railway**: Easy Node.js deployment
- **Heroku**: Free tier available
- **DigitalOcean App Platform**: $5/month
- **AWS/GCP/Azure**: For large-scale

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable rate limiting
- [ ] Set up logging (Winston + external service)
- [ ] Monitor uptime (UptimeRobot, Pingdom)
- [ ] Configure backups (Supabase handles this)

## 📝 License

MIT

## 🤝 Support

For issues or questions, check:
- Supabase Dashboard: https://supabase.com/dashboard/project/dnbagfqilkxtzpefatpv
- API Logs: Terminal output
