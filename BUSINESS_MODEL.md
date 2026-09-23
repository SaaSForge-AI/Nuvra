# Nuvra Business Model - Nouveau modèle 197$

## Résumé

**Pas d'abonnement mensuel.** Modèle simple et transparent :

- **Plateforme gratuite pour tous** : Tout le monde peut s'inscrire gratuitement et vendre des produits digitaux (formations, ebooks, templates, coaching, etc). Nuvra prend **5%** après frais Stripe, créateur garde **95%**.
- **Formation Nuvra Academy à 197$ une fois** : Accès à vie à la formation complète (8 modules, 50+ leçons) + droit de revente à vie. Quand tu revends à 197$, tu gardes **90%**, Nuvra 10% après frais Stripe.

## Détails

### 1. Plateforme gratuite - 5% / 95%

- Inscription gratuite
- Produits illimités, funnels illimités, pages illimitées
- CRM, emails, automations, analytics, link-in-bio, marketplace
- Vente exemple à 100$:
  - Prix: 10000c
  - Frais Stripe 2.9%+30c: 320c
  - Après frais: 9680c
  - Nuvra 5%: 484c ($4.84)
  - Créateur 95%: 9196c ($91.96 net)

### 2. Formation Nuvra Academy - 197$ lifetime + revente 90/10

- Prix: 197$ = 19700c une fois, accès à vie, pas d'abonnement
- Contenu: 8 modules, 50+ leçons, templates, certificat
- Droit de revente inclus après achat
- Revente exemple à 197$:
  - Prix: 19700c
  - Frais Stripe: 601c ($6.01)
  - Après frais: 19099c
  - Nuvra 10%: 1910c ($19.10)
  - Revendeur 90%: 17189c ($171.89 net)

### 3. Abonnements

- Architecture gardée (`keep_but_optional`) mais cachée dans l'UI pour futur
- Pour l'instant, landing affiche seulement Gratuit + 197$

### 4. Payouts & Refunds

- Payouts: pending → available (14 jours) → processing → paid
- Délai 14j pour gérer refunds/chargebacks
- Refund recalcul auto 90/10 ou 95/5 selon type vente
- Ledger immuable: SALE, REFUND, COMMISSION, FEE, PAYOUT, REVERSAL

### 5. Flux utilisateur

1. S'inscrit gratuitement → accès plateforme → peut vendre (95% pour lui)
2. Veut apprendre + revendre → achète Academy à 197$ → accès formation + droit revente activé
3. Partage lien /r/slug → vente à 197$ → 90% pour lui (~172$)
4. Vend ses propres produits → 95% pour lui

### 6. Transparence

Toujours afficher:
- Prix vente
- Frais Stripe séparés
- Part Nuvra
- Part créateur/revendeur
- Montant net

Jamais de commission ambiguë.

### 7. Avantages

- Pas de barrière abonnement mensuel → plus de créateurs
- 5% très léger → compétitif vs 10-30% marketplace classique
- 197$ une fois → LTV clair, pas de churn abonnement
- 90% revente → incitation forte à revendre Academy
- Modèle scalable, simple à comprendre
