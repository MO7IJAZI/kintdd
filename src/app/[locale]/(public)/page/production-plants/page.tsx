'use client';

import Image from 'next/image';

export default function ProductionPlantsPage() {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Production Plants</h1>
                        <p className="hero-subtitle">
                            State-of-the-art manufacturing facilities
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section">
                <div className="container">
                    {/* Intro */}
                    <div className="intro-section">
                        <div className="intro-grid">
                            <div className="intro-text">
                                <h2 className="section-title">Manufacturing Excellence</h2>
                                <p>
                                    KINT Kafri International currently has two production plants located in southern Poland.
                                </p>
                            </div>
                            <div className="intro-image">
                                <div className="image-placeholder">
                                    <Image 
                                        src="/images/about/production-plant.jpg" 
                                        alt="Production Plant" 
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manufactured Products */}
                    <div className="content-section">
                        <h2>Manufactured Products</h2>
                        <p>Manufactured products include:</p>
                        <ul className="product-list">
                            <li>liquid and suspension fertilizer concentrates</li>
                            <li>crystalline soluble fertilizers</li>
                            <li>fertilizer chelates and feed chelates in the form of ultragranules and liquid</li>
                            <li>granular fertilizers</li>
                            <li>pro-health products for animals in aqueous, oil, and aqueous-oil formulation.</li>
                        </ul>
                    </div>

                    {/* Production Facilities */}
                    <div className="content-section">
                        <h2>Production Facilities</h2>
                        <p>Our production facilities are equipped with:</p>
                        <ul className="product-list">
                            <li>
                                reaction vessels of 1 – 20 m3 capacity, specialized control and measuring 
                                equipment and instruments, and installations for filling finished preparations 
                                in packaging of 0.1 to 1000 liter capacity
                            </li>
                            <li>
                                equipment for weighing, grinding, averaging, and mixing raw materials, as well 
                                as packaging into bags and containers of 0.5 kg to 1000 kg
                            </li>
                            <li>
                                spray-dryers, including a dryer with a spray-bed for the production of ultragranules.
                            </li>
                        </ul>
                    </div>

                    {/* Production Capabilities */}
                    <div className="capability-section">
                        <p>
                            Comprehensive equipment and universal character of individual production lines ensure 
                            high productivity with simultaneous possibility of parallel production of various types 
                            of products and quick change of product. Modern equipment in the production lines are 
                            equipped with systems for automatic control and measurement of technological processes, 
                            visualization, and communication with the company IT system supporting supply, production, 
                            and logistics.
                        </p>
                    </div>

                    {/* Quality & Safety */}
                    <div className="quality-section">
                        <p>
                            All equipment conforms to the highest standards for occupational safety and environmental 
                            protection. Each product batch is subject to thorough quality control before being 
                            released for sale.
                        </p>
                    </div>

                    {/* Gallery Section */}
                    <div className="gallery-section">
                        <h2 className="section-title center">Our Production Facilities</h2>
                        <div className="gallery-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <div key={num} className="gallery-item">
                                    <div className="image-placeholder">
                                        <Image 
                                            src={`/images/about/gallery/PP_${num}.webp`} 
                                            alt={`Production Plant ${num}`} 
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .hero-section {
                    position: relative;
                    min-height: 40vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #142346 0%, #1a2f5c 100%);
                    color: white;
                    text-align: center;
                    padding: 4rem 0;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 2;
                }
                
                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    font-family: var(--font-heading);
                }
                
                .hero-subtitle {
                    font-size: 1.3rem;
                    opacity: 0.9;
                }

                .section {
                    padding: 4rem 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: #142346;
                    font-family: var(--font-heading);
                }

                .section-title.center {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .intro-section {
                    margin-bottom: 3rem;
                }

                .intro-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    align-items: center;
                }

                .intro-text p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #4a5568;
                    margin-bottom: 1rem;
                }

                .intro-image .image-placeholder {
                    position: relative;
                    width: 100%;
                    height: 350px;
                    background: linear-gradient(135deg, #e9496c20 0%, #14234620 100%);
                    border-radius: 1.5rem;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #a0aec0;
                    font-size: 1rem;
                }

                .intro-image .image-placeholder::before {
                    content: 'Image: Production Plant';
                }

                .content-section {
                    margin-bottom: 2rem;
                }

                .content-section h2 {
                    font-size: 1.4rem;
                    color: #142346;
                    margin-bottom: 1rem;
                }

                .content-section > p {
                    font-size: 1.1rem;
                    color: #4a5568;
                    line-height: 1.8;
                    margin-bottom: 1rem;
                }

                .product-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .product-list li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-size: 1.05rem;
                    color: #4a5568;
                    line-height: 1.7;
                }

                .product-list li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #e9496c;
                    font-weight: bold;
                }

                .capability-section {
                    margin: 2rem 0;
                    padding: 2rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                }

                .capability-section p {
                    font-size: 1.1rem;
                    color: #4a5568;
                    line-height: 1.8;
                }

                .quality-section {
                    margin: 2rem 0;
                    padding: 2rem;
                    background: linear-gradient(135deg, #142346 0%, #1a2f5c 100%);
                    border-radius: 1.5rem;
                    color: white;
                }

                .quality-section p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                }

                .gallery-section {
                    margin-top: 4rem;
                }

                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }

                .gallery-item {
                    border-radius: 1rem;
                    overflow: hidden;
                    aspect-ratio: 1;
                }

                .gallery-item .image-placeholder {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #e9496c20 0%, #14234620 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #a0aec0;
                    font-size: 0.9rem;
                }

                @media (max-width: 1024px) {
                    .gallery-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .intro-grid,
                    .gallery-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .hero-title {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
