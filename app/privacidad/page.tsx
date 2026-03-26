import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad · Sinkply Tattoo',
  description: 'Política de privacidad de Sinkply Tattoo Madrid.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-light mb-8">Política de privacidad</h1>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">1. Qué datos recogemos</h2>
          <p>
            Al registrarte en Sinkply recogemos tu dirección de correo electrónico y, opcionalmente, tu nombre.
            Si te registras con Google, accedemos a tu nombre y foto de perfil pública de tu cuenta de Google.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">2. Para qué usamos tus datos</h2>
          <p>
            Utilizamos tu email exclusivamente para gestionar tu acceso a la plataforma, permitirte guardar fotos
            en tus colecciones y, si eres tatuador, gestionar tu perfil público. No utilizamos tus datos con fines
            de marketing ni enviamos correos promocionales sin tu consentimiento.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">3. Compartición con terceros</h2>
          <p>
            No compartimos, vendemos ni cedemos tus datos personales a terceros. Tus datos se almacenan de forma
            segura en servidores de Supabase (infraestructura de AWS) dentro de la Unión Europea.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">4. Cookies</h2>
          <p>
            Utilizamos cookies técnicas necesarias para mantener tu sesión activa. No utilizamos cookies de
            seguimiento, publicidad ni analítica de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">5. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento contactando con
            nosotros. También puedes acceder, rectificar o exportar tus datos personales.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900 mb-2">6. Contacto</h2>
          <p>
            Para cualquier consulta sobre privacidad, escríbenos a{' '}
            <a href="mailto:hola@sinkply.com" className="text-gray-900 underline">hola@sinkply.com</a>.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">
          Última actualización: marzo 2026
        </p>
      </div>
    </div>
  )
}
