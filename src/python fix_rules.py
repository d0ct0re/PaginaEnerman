import json
import requests
from google.oauth2 import service_account
import google.auth.transport.requests as gatr

creds = service_account.Credentials.from_service_account_file(
    'serviceAccountKey.json',
    scopes=['https://www.googleapis.com/auth/cloud-platform']
)
creds.refresh(gatr.Request())

pid = 'enerman-8a7cb'
h = {
    'Authorization': 'Bearer ' + creds.token,
    'Content-Type': 'application/json'
}

rules = 'rules_version = "2"; service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read: if true; allow write: if false; } } }'

r1 = requests.post(
    f'https://firebaserules.googleapis.com/v1/projects/{pid}/rulesets',
    headers=h,
    json={'source': {'files': [{'content': rules, 'name': 'firestore.rules'}]}}
)

rn = r1.json().get('name', '')
print('Ruleset:', r1.status_code, rn)

r2 = requests.patch(
    f'https://firebaserules.googleapis.com/v1/projects/{pid}/releases/cloud.firestore',
    headers=h,
    json={
        'name': f'projects/{pid}/releases/cloud.firestore',
        'rulesetName': rn
    }
)
print('Release:', r2.status_code)
if r2.status_code == 200:
    print('REGLAS ACTUALIZADAS CORRECTAMENTE')
else:
    print(r2.text[:300])