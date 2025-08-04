import '../../styles/home.css';
import Link from "next/link"

export default function IndexPage() {
  return (
    <>
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <h1 className="floating">@(Zare)</h1>
            <p className="hero-subtitle">Open Source Template Engine</p>
            <p className="hero-description">
              Build powerful, flexible templates with ease. Zare combines simplicity with advanced features,
              giving developers the tools they need to create dynamic content efficiently.
            </p>
            <div className="cta-buttons">
              <Link href="/docs/get-started/intro" className="btn btn-primary">Get Started</Link>
              <a href="https://github.com/ismailbinmujeeb/zare" className="btn btn-secondary">View on GitHub</a>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title fade-in">Why Choose Zare?</h2>
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>⚡</span></div>
              <h3>Lightning Fast</h3>
              <p>Optimized for performance with minimal overhead. Compile templates blazingly fast with our efficient engine.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>🌱</span></div>
              <h3>Flexible Syntax</h3>
              <p>Intuitive template syntax that's easy to learn yet powerful enough for complex use cases.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>🧩</span></div>
              <h3>Extensible</h3>
              <p>Plugin architecture allows you to extend functionality and customize behavior to fit your needs.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>⚔️</span></div>
              <h3>Production Ready</h3>
              <p>Tested in production environments with comprehensive error handling and debugging tools.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>📌</span></div>
              <h3>Well Documented</h3>
              <p>Comprehensive documentation with examples, tutorials, and best practices to get you started quickly.</p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon"><span>🌟</span></div>
              <h3>Open Source</h3>
              <p>Free and open source with an active community. Contribute, customize, and make it your own.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}