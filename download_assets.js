import fs from 'fs';
import https from 'https';
import path from 'path';

const imagesToDownload = [
  // Fachada e exterior
  { name: 'casa_exterior_olival.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8369-1-1024x683.jpg' },
  { name: 'casa_olival_geral.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/L1070947-1024x768.jpg' },
  { name: 'alpendre_refeicoes.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2021/09/Alpendre-1-1024x768.jpg' },
  { name: 'patio_solario.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8353-2_-1-1024x684.jpg' },
  { name: 'olival_laranjeiras.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2021/09/Olival-1-1024x768.jpg' },
  // Interiores Piso 0
  { name: 'sala_estar_salamandra.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8382-1024x684.jpg' },
  { name: 'sala_jantar_bookcrossing.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8361-2_01-1024x684.jpg' },
  { name: 'cozinha_equipada.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2021/09/Cozinha-1-1024x683.jpg' },
  // Quartos Piso 1
  { name: 'quarto_mocambique.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8329-1024x684.jpg' },
  { name: 'quarto_suecia.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8344-1024x684.jpg' },
  { name: 'quarto_portugal.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8337-1024x684.jpg' },
  { name: 'wc_superior.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2018/06/DSC_8363-2-1024x684.jpg' },
  // Anfitriã
  { name: 'anfitria_maria_joao.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/10/FOTO-1024x768.jpg' },
  // Atividades e arredores
  { name: 'fragas_sao_simao.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/DSC_b_8650-1024x680.jpg' },
  { name: 'aldeia_xisto_casal.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/Figueiró-04-1024x683.jpg' },
  { name: 'passadicos_sao_simao.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2020/08/Passadicos1-769x1024.jpg' },
  { name: 'figueiro_centro_historico.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/Figueiró-08-1024x680.jpg' },
  { name: 'praia_fluvial_ana_avis.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/Arredores-14-1024x680.jpg' },
  { name: 'albufeira_castelo_bode.jpg', url: 'https://casadoolivalfv.pt/wp-content/uploads/2017/09/Arredores-13-1024x680.jpg' }
];

const destDir = 'projects/casadoolival/04_prototype/assets/images';

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const destPath = path.join(destDir, item.name);
    const file = fs.createWriteStream(destPath);
    https.get(item.url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`OK: ${item.name}`);
          resolve();
        });
      } else {
        console.error(`Falha [${response.statusCode}] para ${item.url}`);
        file.close();
        fs.unlinkSync(destPath);
        resolve(); // não quebrar o loop
      }
    }).on('error', (err) => {
      console.error(`Erro: ${item.name} - ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  for (const img of imagesToDownload) {
    await downloadFile(img);
  }
  // Copiar logótipo
  fs.copyFileSync('projects/casadoolival/01_audit_setup/logo_original.jpg', 'projects/casadoolival/04_prototype/assets/logos/logo.jpg');
  console.log('Todos os assets descarregados com sucesso para 04_prototype/assets/');
}

run();
