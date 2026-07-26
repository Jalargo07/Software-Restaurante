<script setup lang="ts">
import PublicHeader from '../../components/public/PublicHeader.vue'
import FooterSection from '../../components/landing/FooterSection.vue'
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <PublicHeader />

    <main>
      <section class="relative py-24 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Política de Privacidad</h1>
          <p class="mt-4 text-lg text-emerald-100">Última actualización: 26 de julio de 2026</p>
        </div>
      </section>

      <section class="py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert max-w-none space-y-10">

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Información que Recopilamos</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Recopilamos información que usted nos proporciona directamente al crear una cuenta,
              como nombre, dirección de email y contraseña. También recopilamos datos de uso
              derivados de la interacción con la plataforma, como páginas visitadas, acciones
              realizadas y preferencias. En el caso de pagos, procesamos información de
              transacciones a través de proveedores de pago externos (PayPal), sin almacenar
              datos de tarjetas de crédito en nuestros servidores.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Uso de la Información</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Utilizamos la información recopilada para: proveer y mantener el servicio,
              mejorar la plataforma y desarrollar nuevas funcionalidades, enviar comunicaciones
              relacionadas con su cuenta y el servicio, prevenir fraudes y proteger la seguridad
              de la plataforma, y cumplir con obligaciones legales cuando corresponda.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Cookies y Tecnologías de Rastreo</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              BiteOps utiliza cookies y tecnologías similares para mantener su sesión activa,
              recordar sus preferencias y mejorar su experiencia de uso. Puede configurar su
              navegador para rechazar cookies, aunque esto podría afectar la funcionalidad
              de la plataforma.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Compartir Información con Terceros</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              No vendemos ni compartimos su información personal con terceros, excepto en los
              siguientes casos: proveedores de servicios necesarios para operar la plataforma
              (hosting, procesamiento de pagos), cuando sea requerido por ley, o en caso de
              una fusión, adquisición o venta de activos.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Seguridad de los Datos</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su
              información contra acceso no autorizado, alteración, divulgación o destrucción.
              Las contraseñas se almacenan con hash bcrypt y las comunicaciones se realizan
              mediante HTTPS.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Tus Derechos</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Usted tiene derecho a acceder a su información personal, rectificarla si es
              incorrecta, solicitar su eliminación y oponerse a su procesamiento. Para ejercer
              estos derechos, puede contactarnos a través de contacto@biteops.app.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Cambios en esta Política</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Nos reservamos el derecho de actualizar esta política de privacidad en cualquier
              momento. Los cambios serán publicados en esta página con la fecha de última
              actualización. Le recomendamos revisar esta política periódicamente.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Contacto</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en
              <a href="mailto:contacto@biteops.app" class="text-emerald-600 dark:text-emerald-400 hover:underline">contacto@biteops.app</a>.
            </p>
          </div>

        </div>
      </section>
    </main>

    <FooterSection />
  </div>
</template>
