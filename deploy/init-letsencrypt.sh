#!/usr/bin/env bash
# ==============================================================================
# Let's Encrypt SSL Initialization Script for Linux VPS
# Physics Association Platform - Shahid Beheshti 2 High School
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 your-domain.com admin-email@example.com"
    exit 1
fi

DOMAIN="$1"
EMAIL="$2"

echo "=========================================================="
echo " Initializing SSL for domain: ${DOMAIN}"
echo " Admin Email: ${EMAIL}"
echo "=========================================================="

# Create temporary standalone or webroot challenge
docker run --rm \
    -v physics_certbot_conf:/etc/letsencrypt \
    -v physics_certbot_www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    -w /var/www/certbot \
    -d "${DOMAIN}" \
    --email "${EMAIL}" \
    --rsa-key-size 4096 \
    --agree-tos \
    --non-interactive

echo "SSL Certificate generated successfully for ${DOMAIN}."
echo "Reloading Nginx..."
docker compose exec nginx nginx -s reload
echo "Done."
