import Link from "next/link";
import "../../../styles/footer.css";

export default function FooterComponent() {

    return (
        <footer>
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Product</h4>
                        <Link href="/docs/get-started/intro">Documentation</Link>
                        <Link href="/docs/cli/quick-start">CLI</Link>
                    </div>
                    <div className="footer-section">
                        <h4>Community</h4>
                        <a href="https://github.com/ismailbinmujeeb/zare">GitHub</a>
                        <a href="https://discord.gg/DyPFCMSkdy">Discord</a>
                        <a href="https://x.com/ZareJs">Twitter</a>
                        <a href="https://www.reddit.com/r/Zare/">Reddit</a>
                    </div>
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <Link href="/blog">Blog</Link>
                        <Link href="/docs/get-started/intro">Documentation</Link>
                        <a href="https://github.com/IsmailBinMujeeb/zare/blob/main/packages/zare/CHANGELOG.md">Changelog</a>
                        <a href="https://github.com/IsmailBinMujeeb/zare/blob/main/packages/zare/README.md">Readme</a>
                    </div>
                    <div className="footer-section">
                        <h4>Support</h4>
                        <a href="https://discord.com/channels/1366263002336067715/1366367025403789373">Help Center</a>
                        <a href="https://github.com/IsmailBinMujeeb/zare/issues/new?labels=bug">Bug Reports</a>
                        <a href="https://github.com/IsmailBinMujeeb/zare/issues/new?labels=enhancement">Feature Requests</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>MIT &copy; {new Date().getFullYear()} Zare Template Engine. Open source and free forever.</p>
                </div>
            </div>
        </footer>
    )
}