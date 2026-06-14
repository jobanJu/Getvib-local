import { test, expect } from '@playwright/test';
import path from 'path';

const randomId = Math.floor(Math.random() * 10000);
const TEST_USER = {
  firstName: 'Bot',
  lastName: `Testeur${randomId}`,
  city: 'Lille',
  email: `bot${randomId}@getvib.fr`,
  password: 'Password123!',
  pseudo: `bot_${randomId}`,
  age: '25'
};

test.describe('Scénario Autonome Robuste', () => {

  test('Inscription, Charte et Création', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // 1. Inscription
    console.log('--- Étape 1 : Inscription ---');
    await page.goto('/signup');
    
    await page.fill('input[name="firstName"]', TEST_USER.firstName);
    await page.fill('input[name="lastName"]', TEST_USER.lastName);
    await page.fill('input[name="pseudo"]', TEST_USER.pseudo);
    await page.fill('input[name="age"]', TEST_USER.age);
    await page.fill('input[name="city"]', TEST_USER.city);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has(svg.lucide-camera)').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(process.cwd(), 'test-photo.jpg'));
    
    await page.click('button[type="submit"]');

    // Attente écran de succès ou redirection
    console.log('Attente de l\'écran de succès...');
    const welcomeBtn = page.locator('button:has-text("Entrer dans GetVib")');
    try {
        await welcomeBtn.waitFor({ state: 'visible', timeout: 10000 });
        await welcomeBtn.click();
        console.log('✅ Bouton bienvenue cliqué');
    } catch (e) {
        console.log('ℹ️ Écran de succès non vu, peut-être redirection directe...');
    }

    // Attente redirection
    await expect(page).toHaveURL(/.*discover/, { timeout: 20000 });
    console.log('✅ Inscription réussie');

    // 2. Acceptation de la Charte (Logique Robuste)
    console.log('--- Étape 2 : Vérification de la Charte ---');
    const acceptBtn = page.locator('button:has-text("J\'AI LU ET J\'ACCEPTE")');
    
    // On attend un peu pour voir si elle apparaît
    try {
        await acceptBtn.waitFor({ state: 'visible', timeout: 5000 });
        await acceptBtn.click();
        console.log('✅ Charte acceptée');
    } catch (e) {
        console.log('ℹ️ Charte non visible immédiatement, on continue...');
    }

    // 3. Création de soirée
    console.log('--- Étape 3 : Création de soirée ---');
    await page.goto('/create');
    
    // Si la charte apparaît ici (car on change de page)
    try {
        if (await acceptBtn.isVisible()) {
            await acceptBtn.click();
            console.log('✅ Charte acceptée sur la page Créer');
        }
    } catch (e) {}

    const testTitle = `Vibe du Bot ${randomId}`;
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="description"]', 'Une super soirée de test.');
    await page.fill('input[name="city"]', TEST_USER.city);
    await page.fill('input[name="address"]', '10 rue de la Vibe, 59000 Lille');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateStr);
    await page.fill('input[name="time"]', '20:00');
    await page.fill('input[name="maxParticipants"]', '8');
    
    // Sélectionner la Vibe "Musique" (Obligatoire)
    console.log('Sélection de la vibe...');
    await page.click('button:has-text("Musique")');

    // On ne met pas de photo pour la soirée dans le test pour éviter les erreurs de format
    // await page.locator('label:has(svg.lucide-image-plus)').click(); 
    
    // Avant de cliquer, on vérifie encore une fois si le blocker est là
    if (await acceptBtn.isVisible()) {
        await acceptBtn.click();
    }

    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*event\/.*/, { timeout: 20000 });
    console.log(`✅ Soirée "${testTitle}" créée`);

    // 4. Vérification de l'adresse
    console.log('--- Étape 4 : Vérification Adresse ---');
    const addressLocator = page.locator('text=10 rue de la Vibe');
    await addressLocator.waitFor({ state: 'visible', timeout: 15000 });
    await expect(addressLocator).toBeVisible();
    console.log('✅ Adresse visible pour l\'hôte');
  });

});
