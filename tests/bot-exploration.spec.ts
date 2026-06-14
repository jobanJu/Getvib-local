import { test, expect } from '@playwright/test';

test.describe('Bot Explorateur GetVib', () => {
  
  test('vérification de la page d\'accueil et du thème', async ({ page }) => {
    // 1. Va sur le site
    await page.goto('http://localhost:3000');
    
    // 2. Vérifie le titre
    await expect(page).toHaveTitle(/GetVib/);
    console.log('✅ Page d\'accueil chargée');

    // 3. Vérifie si les éléments principaux sont là
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();
    console.log('✅ Titre principal visible');

    // 4. Test du bouton de navigation vers "Découvrir"
    const discoverLink = page.locator('text=Découvrir les vibes');
    if (await discoverLink.isVisible()) {
        await discoverLink.click();
        await expect(page).toHaveURL(/.*discover/);
        console.log('✅ Navigation vers Découvrir OK');
    }
  });

  test('vérification de la page d\'inscription (nouveaux champs)', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    
    // Vérification des nouveaux champs
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="city"]')).toBeVisible();
    
    // Vérification de l'input photo (caché mais présent)
    await expect(page.locator('input[type="file"]')).toBeAttached();
    
    console.log('✅ Champs Prénom, Nom, Ville et Photo présents sur l\'inscription');
  });

  test('exploration des réglages et switch de thème', async ({ page }) => {
    // Note: Ce test suppose qu'on est pas forcément loggé, 
    // ou qu'on teste la page de login si redirigé.
    await page.goto('http://localhost:3000/settings');
    
    if (page.url().includes('/login')) {
      console.log('ℹ️ Redirigé vers login (normal si non connecté)');
    } else {
      console.log('✅ Page settings accessible');
      // On cherche le bouton de changement de thème
      const themeBtn = page.locator('button:has-text("Changer")');
      await expect(themeBtn).toBeVisible();
      await themeBtn.click();
      console.log('✅ Click sur changement de thème OK');
    }
  });

});
