# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-report-flow.spec.ts >> Flux de Signalement Admin >> Signalement et Modération
- Location: tests/admin-report-flow.spec.ts:5:7

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "GetVib GetVib" [ref=e5] [cursor=pointer]:
          - /url: /
          - img "GetVib" [ref=e7]
          - generic [ref=e8]: GetVib
        - navigation [ref=e9]:
          - link "Découvrir" [ref=e10] [cursor=pointer]:
            - /url: /discover
          - link "Créer" [ref=e11] [cursor=pointer]:
            - /url: /create
          - link "Amis" [ref=e12] [cursor=pointer]:
            - /url: /amis
          - link "Messages" [ref=e13] [cursor=pointer]:
            - /url: /messages
          - link "Profil" [ref=e14] [cursor=pointer]:
            - /url: /profile
        - generic [ref=e15]:
          - link [ref=e16] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e17]
          - link [ref=e20] [cursor=pointer]:
            - /url: /safety
            - img [ref=e21]
          - link "Centre d'aide" [ref=e23] [cursor=pointer]:
            - /url: /aide
            - img [ref=e24]
          - link [ref=e31] [cursor=pointer]:
            - /url: /settings
            - img [ref=e32]
    - main [ref=e35]:
      - generic [ref=e36]:
        - heading "Paramètres" [level=1] [ref=e37]
        - generic [ref=e38]:
          - generic [ref=e39]:
            - heading "Apparence" [level=2] [ref=e40]:
              - img [ref=e41]
              - text: Apparence
            - generic [ref=e47]:
              - generic [ref=e48]:
                - paragraph [ref=e49]: Mode Clair
                - paragraph [ref=e50]: Basculez entre le mode clair et sombre.
              - button "Changer" [ref=e51] [cursor=pointer]:
                - img [ref=e52]
                - text: Changer
          - generic [ref=e54]:
            - heading "Mon Profil" [level=2] [ref=e55]:
              - img [ref=e56]
              - text: Mon Profil
            - generic [ref=e60]:
              - generic [ref=e61]:
                - generic [ref=e62] [cursor=pointer]:
                  - img [ref=e64]
                  - img [ref=e68]
                - paragraph [ref=e71]: Cliquez pour changer votre photo
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - text: Nom Complet
                  - textbox "Nom Complet" [ref=e74]:
                    - /placeholder: Prénom Nom
                    - text: Jean Reporter
                - generic [ref=e75]:
                  - text: Pseudo
                  - generic [ref=e76]:
                    - generic: "@"
                    - textbox "Pseudo @ Identifiant unique pour la recherche d'amis." [ref=e77]:
                      - /placeholder: lele59
                  - paragraph [ref=e78]: Identifiant unique pour la recherche d'amis.
                - generic [ref=e79]:
                  - text: Email
                  - textbox "Email" [disabled] [ref=e80]: reporter@test.fr
                - generic [ref=e81]:
                  - text: Téléphone
                  - textbox "Téléphone" [ref=e82]:
                    - /placeholder: 06 12 34 56 78
                - generic [ref=e83]:
                  - text: Âge
                  - textbox "Âge L'âge ne peut plus être modifié après l'inscription." [disabled] [ref=e84]
                  - paragraph [ref=e85]: L'âge ne peut plus être modifié après l'inscription.
                - generic [ref=e86]:
                  - text: Pays / Région
                  - combobox "Pays / Région" [ref=e87]:
                    - option "France" [selected]
                    - option "Belgique"
                    - option "Suisse"
                    - option "Outre-mer"
                - generic [ref=e88]:
                  - text: Ville
                  - combobox "Ville" [ref=e89]
                - generic [ref=e90]:
                  - text: Nouveau Mot de Passe
                  - textbox "Nouveau Mot de Passe" [ref=e91]:
                    - /placeholder: Laisser vide pour ne pas changer
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - text: Bio
                  - textbox "Bio" [ref=e94]:
                    - /placeholder: Dites-nous en plus sur vous, vos passions...
                - generic [ref=e95]:
                  - generic [ref=e96]:
                    - img [ref=e97]
                    - text: Centres d'intérêt
                    - generic [ref=e99]: (séparés par des virgules)
                  - textbox "Centres d'intérêt (séparés par des virgules)" [ref=e100]:
                    - /placeholder: Jazz, Vin nature, Cuisine, Randonnée...
              - button "Mettre à jour mon profil" [ref=e101] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e107] [cursor=pointer]:
    - img [ref=e108]
  - alert [ref=e111]
```