// Footer.tsx
import React from 'react';
import './estilos.css';
import { FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section footer-social">
          <h4 className="footer-title">Síguenos</h4>
          <div className="footer-icons">
            <a href="https://www.youtube.com/@glamperos" target="_blank" rel="noopener noreferrer" className="footer-icon">
              <FaYoutube />
            </a>
            <a href="https://www.instagram.com/glamperos/" target="_blank" rel="noopener noreferrer" className="footer-icon">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com/glamperos/" target="_blank" rel="noopener noreferrer" className="footer-icon">
              <FaFacebook />
            </a>
          </div>
        </div>

        <div className="footer-section footer-contact">
          <h4 className="footer-title">Contacto</h4>
          <p className="footer-text">WhatsApp: +57 3218695196</p>
          <p className="footer-text">Dirección: Cl. 71 # 58 - 102, Santa Maria, Itagüí</p>
        </div>

        <div className="footer-section footer-links">
          <h4 className="footer-title">Enlaces útiles</h4>
          <ul className="footer-list">
            <li><a href="/blog" className="footer-link">Blog</a></li>
            <li><a href="https://www.youtube.com/watch?v=Tiuu67OQ41k" target="_blank" rel="noopener noreferrer" className="footer-link">Cómo registrar tu glamping</a></li>
          </ul>
        </div>

        <div className="footer-section footer-legal">
          <h4 className="footer-title">Legal</h4>
          <p className="footer-text">
            RNT: <a href="https://storage.googleapis.com/glamperos-imagenes/Imagenes/RNT%20GLAMPEROS%20SAS.pdf" target="_blank" rel="noopener noreferrer">246204</a>
          </p>
          <p className="footer-text">Glamperos SAS</p>
          <p className="footer-text">
            <a href="/politicas-privacidad" className="footer-link">Política de privacidad</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2025 Glamperos. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
