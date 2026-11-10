"""Replace the prelaunch download state in the published static site."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
STORE = "https://apps.apple.com/app/id6818250917"

# Old label, download label, availability text for the existing 20 site locales.
COPY = {
    "en": ("Coming to the App Store", "Download on the App Store", "ShiftMoon is available in the App Store for iPhone."),
    "ar": ("قريبًا على App Store", "حمّل من App Store", "ShiftMoon متاح الآن على App Store لجهاز iPhone."),
    "da": ("Kommer snart i App Store", "Hent i App Store", "ShiftMoon kan nu hentes i App Store til iPhone."),
    "de": ("Bald im App Store", "Im App Store laden", "ShiftMoon ist jetzt im App Store für iPhone verfügbar."),
    "es": ("Muy pronto en el App Store", "Descargar en el App Store", "ShiftMoon ya está disponible en el App Store para iPhone."),
    "fi": ("Tulossa App Storeen", "Lataa App Storesta", "ShiftMoon on nyt saatavilla App Storessa iPhonelle."),
    "fr": ("Bientôt sur l’App Store", "Télécharger sur l’App Store", "ShiftMoon est maintenant disponible sur l’App Store pour iPhone."),
    "he": ("בקרוב ב-App Store", "הורדה מ-App Store", "ShiftMoon זמין כעת ב-App Store ל-iPhone."),
    "it": ("Presto su App Store", "Scarica su App Store", "ShiftMoon è ora disponibile su App Store per iPhone."),
    "ja": ("App Storeで近日公開", "App Storeからダウンロード", "ShiftMoonはiPhone向けにApp Storeで配信中です。"),
    "ko": ("App Store 출시 예정", "App Store에서 다운로드", "ShiftMoon을 이제 iPhone용 App Store에서 다운로드할 수 있어요."),
    "nb": ("Kommer snart i App Store", "Last ned i App Store", "ShiftMoon er nå tilgjengelig i App Store for iPhone."),
    "nl": ("Binnenkort in de App Store", "Download in de App Store", "ShiftMoon is nu beschikbaar in de App Store voor iPhone."),
    "pl": ("Wkrótce w App Store", "Pobierz w App Store", "ShiftMoon jest już dostępny w App Store na iPhone’a."),
    "pt-br": ("Em breve na App Store", "Baixar na App Store", "O ShiftMoon já está disponível na App Store para iPhone."),
    "pt-pt": ("Brevemente na App Store", "Transferir na App Store", "O ShiftMoon já está disponível na App Store para iPhone."),
    "ru": ("Скоро в App Store", "Скачать в App Store", "ShiftMoon уже доступен в App Store для iPhone."),
    "sv": ("Snart på App Store", "Hämta i App Store", "ShiftMoon finns nu i App Store för iPhone."),
    "tr": ("Çok yakında App Store’da", "App Store’dan indir", "ShiftMoon artık iPhone için App Store’da."),
    "uk": ("Незабаром в App Store", "Завантажити в App Store", "ShiftMoon уже доступний в App Store для iPhone."),
}

OLD_LEADS = {
    "en": "The iPhone release is on its way. No download is available yet.",
    "ar": "إصدار iPhone في الطريق. التنزيل غير متاح بعد.",
    "da": "iPhone-versionen er på vej. Den kan endnu ikke hentes.",
    "de": "Die iPhone-Version ist unterwegs. Ein Download ist noch nicht verfügbar.",
    "es": "La versión para iPhone está en camino. Todavía no se puede descargar.",
    "fi": "iPhone-versio on tulossa. Lataus ei ole vielä saatavilla.",
    "fr": "La version iPhone arrive bientôt. Aucun téléchargement n’est encore disponible.",
    "he": "גרסת ה-iPhone בדרך. עדיין אין אפשרות להורדה.",
    "it": "La versione per iPhone è in arrivo. Il download non è ancora disponibile.",
    "ja": "iPhone版は近日公開予定です。まだダウンロードできません。",
    "ko": "iPhone 버전을 준비하고 있어요. 아직 다운로드할 수 없습니다.",
    "nb": "iPhone-versjonen er på vei. Den kan ikke lastes ned ennå.",
    "nl": "De iPhone-versie komt eraan. Downloaden is nog niet mogelijk.",
    "pl": "Wersja na iPhone’a jest w drodze. Pobieranie nie jest jeszcze dostępne.",
    "pt-br": "A versão para iPhone está chegando. O download ainda não está disponível.",
    "pt-pt": "A versão para iPhone está a caminho. Ainda não é possível transferir.",
    "ru": "Версия для iPhone уже в пути. Загрузка пока недоступна.",
    "sv": "iPhone-versionen är på väg. Det går ännu inte att ladda ned.",
    "tr": "iPhone sürümü yolda. Henüz indirme yok.",
    "uk": "Готуємо запуск для iPhone. Завантаження ще недоступне.",
}

def update_anchor(match, label):
    anchor = match.group()
    if 'class="install-cta is-soon"' in anchor:
        anchor = anchor.replace('class="install-cta is-soon"', 'class="install-cta"')
        anchor = re.sub(r'href="[^"]+"', f'href="{STORE}"', anchor, count=1)
        anchor = re.sub(r'(<span class="install-text">.*?<strong>).*?(</strong>)',
                        r'\1App Store\2', anchor, count=1, flags=re.S)
    elif 'class="button violet' in anchor and label in anchor:
        anchor = re.sub(r'href="[^"]+"', f'href="{STORE}"', anchor, count=1)
    return anchor

changed = 0
for path in ROOT.rglob("*.html"):
    relative = path.relative_to(ROOT)
    locale = relative.parts[0] if relative.parts[0] in COPY else "en"
    old_label, label, lead = COPY[locale]
    before = path.read_text()
    after = before.replace(old_label, label).replace(OLD_LEADS[locale], lead)
    after = re.sub(r'<a\b[^>]*>.*?</a>', lambda m: update_anchor(m, label), after, flags=re.S)
    if relative.parts[-2:] == ("download", "index.html"):
        action = f'<div class="actions">\n<a class="button violet" href="{STORE}">{label}</a>\n</div>'
        after, count = re.subn(r'<div class="actions">\s*<a class="button violet" href="[^"]+">.*?</a>\s*</div>',
                               action, after, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError(f"Download action not found: {relative}")
    if locale == "uk":
        after = after.replace("Наразі готуємо версію для iPhone. Android планується пізніше, але дати випуску й завантаження ще немає.",
                              "ShiftMoon уже доступний для iPhone. Android планується пізніше, але дати випуску ще немає.")
    if locale == "ru":
        after = after.replace("Сейчас готовится версия для iPhone. Android запланирован позже, но даты выхода и загрузки пока нет.",
                              "ShiftMoon уже доступен для iPhone. Android запланирован позже, но даты выхода пока нет.")
    if after != before:
        path.write_text(after)
        changed += 1

print(f"Updated {changed} HTML files for the App Store release.")
