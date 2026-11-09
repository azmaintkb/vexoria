# Vexoria store

A local-first storefront and admin panel, prepared for Netlify deployment. Nothing is deployed automatically.

## Run locally

From this directory:

```powershell
npm install
npm run dev
```

- Store: http://localhost:5173
- Admin: http://localhost:5173/admin
- Local preview password: `vexoria-local-preview`

The dev server binds only to your computer. It stores local products, uploaded photos, settings, and orders in `.local-data/`, which is excluded from Git. Restarting the server retains the data but signs out existing admin sessions. This preview password is only created by the local development script; production has no default password.

## Publish products

Open Admin → Products. Four photo drafts are prepared. Edit each draft, enter the actual price in BDT, quantity, description, and verified specifications. Check “Publish on storefront” and save. To hide a product, uncheck “Publish” and save. Categories can be added directly in the editor and appear as storefront filters automatically. New products support a photo upload (JPG, PNG, or WebP under 2.8 MB). Prices use whole taka.

Drafts have no invented prices or specifications. The initial storefront shows a coming-soon photo gallery until at least one product is published.

## Orders & notifications

Guest customers add products to their bag and provide a Bangladesh mobile number, name, delivery location, and full delivery address. The server checks published products and quantity limits, calculates prices itself, and calculates delivery on the server: free for NSU, AIUB, and IUB; Tk 70 inside Dhaka; Tk 130 outside Dhaka. Cash on delivery is the only payment method. Customers explicitly acknowledge the no-return policy before ordering. An opaque reference confirms an order; checkout retries reuse the same reference.

Admin → Orders shows customer details and statuses (New, Confirmed, Packed, Shipped, Delivered, Cancelled). Opening an order marks its notification read. Notifications show email delivery status and provide a retry action. The admin checks for new orders every 30 seconds while open.

**Stock is manual:** the available quantity limits each order, but pending orders do not automatically reserve or decrement inventory. Adjust stock when confirming orders. This avoids silently counting cancelled COD orders as sales, but multiple pending orders can exceed remaining inventory; review before confirming. For high-volume launch, add transactional inventory reservations with a database.

## Contacts

Defaults are WhatsApp `+8801630662672` and public email `vexoriaofficial@gmail.com`. Add Messenger later from Admin → Store settings. WhatsApp links prefill the selected product; Messenger links open the configured page. Website checkout is independent of social messages. Social conversations are not automatically imported as orders.

## Configure email sending

Email is implemented through Resend. No email is sent until all three server environment variables are provided:

```text
ADMIN_EMAIL=vexoriaofficial@gmail.com
RESEND_API_KEY=<your Resend API key>
EMAIL_FROM=Vexoria <orders@your-verified-domain>
```

Verify a sender domain with the email provider first. The public Gmail address can receive alerts but cannot serve as an arbitrary verified sending domain. Failed or unconfigured email does not discard an order. Use Notifications → Retry email after correcting configuration. Keep keys out of browser code and Git. For local email tests, set these environment variables in the terminal before `npm run dev`. The dev server does not automatically load `.env` files.

## Deploy to Netlify later

1. Create your Netlify account and import this `website` directory as the site repository root (or use `website` as the base directory when importing the whole workspace).
2. Build command: `npm run build`. Publish directory: `dist`. Functions directory: `netlify/functions`. The included `netlify.toml` sets these values.
3. Run `node scripts/admin-credentials.mjs` privately in your terminal. Save the generated admin password in a password manager. Add its `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` values to Netlify environment settings with Functions scope. Never commit these values. Use the generated password to sign in after deployment.
4. Add the email environment variables above. Deploy/redeploy after environment changes.
5. Products, settings, uploaded photos, and orders use a site-wide Netlify Blobs store named `vexoria-store`. Netlify Functions supplies storage credentials automatically. Local data is not transferred to Netlify: publish the four drafts and any additional products again after deployment.
6. Before accepting real orders, verify product accuracy, delivery operations, production login, image uploads, checkout, and receipt of a real test email. Hosting, storage, and email usage follow the providers’ account plans.

The production admin requires HTTPS and a configured secret/hash. It uses an eight-hour HttpOnly, Secure, SameSite cookie, password hashing, same-origin POST checks, and basic persisted login throttling. Checkout has a basic per-IP order cap. Add stronger bot protection if abuse occurs. Rotate the session secret to invalidate all sessions. Local preview is not a production security substitute.

## Verification

```powershell
npm test
npm run build
```

Tests cover authentication, publication validation, price tampering, quantity limits, guest validation, duplicate order protection, admin access, notification persistence, and status updates. Test records use an isolated temporary directory. The app uses system fonts and optimized product images, with no storefront framework bundle or third-party font requests.

## Design references

The warm white palette, restrained navigation, generous spacing, and photography-led collection were informed by [KINTO](https://kinto-usa.com/collections/jug-carafe). Original Vexoria logo and product images come from the supplied workspace. Photo colors are descriptive draft names, not verified product specifications.

The store’s policies reflect the requested delivery and no-return terms. Review the finished policies and operational details before a public launch.


Product cards have Add to cart and Buy now controls. Buy now adds one item to the existing cart and opens /checkout. Checkout collects name, phone, full address, delivery location, and optional notes. The server validates the chosen delivery option and ignores client-supplied shipping totals. University eligibility is self-selected and visible to the admin for confirmation; it is not automatically verified. Current local launch prices are Tk 549 for each of the four pots.


Address-based checkout: district and thana/upazila are required. Dhaka city thanas use Tk 70; surrounding Dhaka upazilas (including Savar/Ashulia/Keraniganj) and other districts use Tk 130. Selecting NSU, AIUB or IUB sets the campus district/thana/address and free delivery. Server derives the fee and saves canonical district/thana names. Location names are bundled from https://github.com/HedaetShahriar/bangladesh-locations-dataset (MIT); license in vendor/bangladesh-locations-LICENSE.txt. Delivery classifications are store policy, not dataset courier classifications.


Current mobile checkout (Nov 2026): name, phone, full address and deliveryOption only. Delivery choices use existing Tk 70 / Tk 130 / campus-free rates; full address includes district/thana in one field. Legacy structured-address orders remain supported. Product price is the amount charged; optional originalPrice must exceed it and displays crossed out. Existing products keep their current prices until edited in admin.
