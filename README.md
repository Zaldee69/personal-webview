## Environment Variables:

- NEXT_PUBLIC_BASE_PATH
- NEXT_PUBLIC_DS_API_URL
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_PORTAL_URL
- NEXT_PUBLIC_PERSONAL_API_URL

## Halaman

### Label berseta Path halaman (total 22 halaman)

- **SERVER_SIDE_CHECKSTEP**

  1. `/certificate-information`
  2. `/certificate-information`
  3. `/form/success`
  4. `/kyc/changepinform`
  5. `/kyc/resetpinform`
  6. `/link-account`
  7. `/link-account/failure`
  8. `/link-account/success`
  9. `/liveness-fail`
  10. `/liveness-failure`
  11. `/login`
  12. `/setting-signature-and-mfa`
  13. `/signing`
  14. `/`

- **CLIENT_SIDE_CHECKSTEP**

  1. `/guide`
  2. `/liveness`
  3. `/form`
  4. `/kyc/pinform`

- **\_NO_CHECKSTEP**

  1. `/signing/authpin`

- **\_UNUSED_PAGE**

  1. `/reset-password`
  2. `/reset-password/success`
  3. `/forgot-password`
  4. `/forgot-tilaka-name`

### Penjelasan Label

> **CLIENT_SIDE_CHECKSTEP** mengecek di sisi client, akan ada redirect mechanism sesuai status dan menampilkan notifikasi ketika pengecekan berhasil ataupun gagal. Logic menyesuaikan, tiap-tiap halaman bisa memiliki logic pengecekan yang berbeda.

> **SERVER_SIDE_CHECKSTEP** hanya meredirect sesuai status ketika pengecekan berhasil, ketika gagal tidak ada notifikasi dan halaman tidak akan diredirect. Logic strict, tiap-tiap halaman memiliki logic pnegecekan yang sama.

> **\_NO_CHECKSTEP** tidak melakukan checkstep.

> **\_UNUSED_PAGE** halaman yang tidak digunakan, akan di redirect ke halaman / lalu akan dilakukan pengecekan status dihalaman /, jika parameter registration_id, transaction_id atau request_id tidak tersedia di url atau pengecekan gagal maka tidak meredirect kemanapun.

### Status yang dicek oleh SERVER_SIDE_CHECKSTEP lalu diredirect

- **D** => `/kyc/pinform?registration_id=` atau `/kyc/pinform?request_id=`

- **B** => `/guide?request_id=`

- **E** => `/liveness-failure?request_id=`

- **F** => `/liveness-failure?request_id=` atau ke `redirect_url` yang di kirim lewat parameter

- **S** => `redirect_url` yang dikirim lewat parameter, beserta parameter berikut `?register_id=<uuid>&status=<status>`

### Status yang tidak dicek oleh SERVER_SIDE_CHECKSTEP lalu tidak diredirect

- **A** => ?

- **C** => ?

## Catatan

> untuk **CLIENT_SIDE_CHECKSTEP**, jika token tersedia diresponse maka `kyc_checkstep_token` akan di set di localStorage. lalu untuk SERVER_SIDE_CHECKSTEP, jika token tersedia diresponse maka `kyc_checkstep_token` tidak akan di set di localStorage.

> **SERVER_SIDE_CHECKSTEP** mengenal parameter `registration_id`, `transaction_id` dan `request_id` sebagai **uuid**.
