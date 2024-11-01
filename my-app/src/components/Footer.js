import img from '../images/img1.png'
import '../components.style/Footer.css'


export default function Footer(){


    return (
        <footer className='PKF-Footer'>
            <div className='Container'>
                <div className='row'>

                 <div className='logo'>
                     <a href='https://www.pkf.pt/' title='PKF Portugal'>
                        <img src={img} alt='Footer Logo'></img>
                     </a>   
                 </div>

                 <div className='menu'>

                    <div className='FooterMenu'>
                            <h5>Sobre</h5>
                                <ul>
                                    <li>
                                        <a href='https://www.pkf.pt/quem-somos/'>Quem Somos</a>
                                    </li>
                                    <li>
                                        <a href='https://www.pkf.pt/contactos/'>Fale Connosco</a>
                                    </li>
                                    <li>
                                        <a href='https://www.pkf.pt/pkf-disclaimer/'>PKF Disclaimer</a>
                                    </li>
                                    <li>
                                        <a href='https://www.pkf.pt/pkf-disclaimer/politica-de-cookies/'>Política de Cookies</a>
                                    </li>
                                    <li>
                                        <a href='https://www.pkf.pt/pkf-disclaimer/politica-de-privacidade/'>Política de Privacidade</a>
                                    </li>
                                    <li>
                                        <a href='https://www.pkf.pt/pkf-disclaimer/politica-da-qualidade/'>Política da Qualidade</a>
                                    </li>
                                </ul>

                    </div>

                    <div className='FooterMenu'>

                    <h5>Serviços</h5>
                        <ul>
                            <li>
                                <a href='https://www.pkf.pt/quem-somos/'>Auditoria</a>
                            </li>
                            <li>
                                <a href='https://www.pkf.pt/contactos/'>Assessoria Fiscal</a>
                            </li>
                            <li>
                                <a href='https://www.pkf.pt/pkf-disclaimer/'>Corporate Finance</a>
                            </li>
                            <li>
                                <a href='https://www.pkf.pt/pkf-disclaimer/politica-de-cookies/'>Financial & Risk</a>
                            </li>
                            <li>
                                <a href='https://www.pkf.pt/pkf-disclaimer/'>Strategic Advisory</a>
                            </li>
                            <li>
                                <a href='https://www.pkf.pt/pkf-disclaimer/politica-de-privacidade/'>View all</a>
                            </li>
                        </ul>

                    </div>

                    <div className='FooterMenu'>

                    <h5>Parceiros</h5>
                    <ul>
                        <li>
                            <a href='https://www.pkf.pt/quem-somos/'>Outsystems</a>
                        </li>
                        <li>
                            <a href='https://www.pkf.pt/contactos/'>Primavera</a>
                        </li>
                    </ul>

                    </div>

                    <div className='FooterMenu'>

                        <li>
                        <a href='https://www.pkfacademy.com/'>PFK Academy</a>
                        </li>

                    </div>

                 </div>
                 
                </div>
            </div>

        </footer>
                

        
        
    )

}