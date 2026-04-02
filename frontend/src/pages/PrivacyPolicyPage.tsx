import { Shield } from 'lucide-react'

export function PrivacyPolicyPage() {
    return (
        <div className="container max-w-4xl mx-auto py-12 px-6">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            </div>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
                <p>This Privacy Policy describes the ways we collect personal data about you and why we do so, how we use your personal data, and the choices you have about your personal data.</p>
                <p>This Privacy Policy applies to moviesearchdb users when using our services. We may periodically update this Privacy Policy by posting a new version online.</p>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">The data we collect</h2>
                    <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Data you provide us:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Contact information (such as email address).</li>
                        <li>Password.</li>
                        <li>Profile information.</li>
                        <li>Your messages to the Service (such as support requests).</li>
                        <li>Other data you choose to give us.</li>
                    </ul>
                    <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Data we collect automatically:</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Data about your account and progress using the platform.</li>
                        <li>Data about your use of the Service.</li>
                        <li>Data about your device, such as IP address; device name and ID; operating system, browser type and language.</li>
                        <li>Data we collect with cookies and similar technologies (see more below).</li>
                        <li>General location data based on your IP address.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Why we collect and process your data</h2>
                    <p>We collect and process your data to:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>create accounts and allow you to use our Service.</li>
                        <li>communicate with you and send you Service-related communications.</li>
                        <li>develop and improve the Service through research and analysis based on profile data.</li>
                        <li>operate the Service.</li>
                        <li>perform marketing.</li>
                        <li>keep the Service safe and fair and to fight fraud by analyzing and monitoring the use of the Service and taking action against non-wanted activity.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Who can see your data</h2>
                    <p>The Service is designed to be collaborative and team-focused. Therefore your data may be disclosed to other users, but only to the extent this is necessary to fulfil the purpose. Otherwise, only those working for the Service have access to your personal data on a need-to-know basis.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">International data transfers</h2>
                    <p>moviesearchdb has partners to perform services for us. These partners process your data according to our instructions to provide the Service, such as hosting, technical support, analytics and fraud prevention. Because different countries may have different data protection laws than your own country, we take steps to ensure adequate safeguards are in place to protect your data as explained in this Policy.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Your rights and options</h2>
                    <p><strong>Access the personal data we hold about you:</strong> If you request, we will provide you a copy of your personal data in an electronic format.</p>
                    <p className="mt-2"><strong>Your other rights:</strong> You also have the right to correct your data, have your data deleted, object or restrict how we use your data, or withdraw any consent you have given. We will respond to all requests within a reasonable timeframe. If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, you may contact your local data protection authority within the European Economic Area for unresolved complaints.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">How do we protect your data</h2>
                    <p><strong>Security Safeguards:</strong> In order to help ensure a secure and safe Service, we are continuously developing and implementing administrative, technical and physical security measures to protect your data from unauthorized access or against loss, misuse or alteration.</p>
                    <p className="mt-2"><strong>Data retention:</strong> We retain your personal data for the period necessary to fulfil the purposes outlined in this Privacy Policy, unless a longer period is required by law. Note that if you ask us to remove your personal data, we will retain your data as necessary to comply with our legal obligations or defend our rights.</p>
                </section>

                <p className="text-sm mt-12 bg-muted p-4 rounded-lg border border-border">Last updated: April 2, 2026</p>
            </div>
        </div>
    )
}
