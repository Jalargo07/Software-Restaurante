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
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">Términos y Condiciones</h1>
          <p class="mt-4 text-lg text-emerald-100">Última actualización: 26 de julio de 2026</p>
        </div>
      </section>

      <section class="py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert max-w-none space-y-10">

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Aceptación de los Términos</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Al acceder y utilizar BiteOps, usted acepta estos términos y condiciones en su
              totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar
              la plataforma.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Descripción del Servicio</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              BiteOps es una plataforma SaaS (Software como Servicio) diseñada para la gestión
              integral de restaurantes. Incluye módulos de inventario, ventas, compras, mesas,
              comandas, reportes, branding y más. El servicio se provee a través de internet
              y está disponible las 24 horas del día, los 7 días de la semana.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Cuentas de Usuario</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Usted es responsable de mantener la confidencialidad de sus credenciales de acceso
              y de todas las actividades que ocurran bajo su cuenta. Debe notificarnos
              inmediatamente ante cualquier uso no autorizado. BiteOps no se hace responsable
              por pérdidas derivadas del uso indebido de credenciales.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Planes y Pagos</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              BiteOps ofrece planes de suscripción mensual con distintos niveles de acceso y
              funcionalidades. Los pagos se procesan a través de PayPal. La cancelación de un
              plan es efectiva al final del período de facturación vigente. No se realizan
              reembolsos proporcionalmente por cancellationes a mitad de ciclo.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Propiedad Intelectual</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              El código fuente, diseño, marcas y demás elementos de la plataforma son propiedad
              exclusiva de BiteOps. Los datos que usted ingresa a la plataforma le pertenecen
              exclusivamente a usted. Puede exportar sus datos en cualquier momento.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Limitación de Responsabilidad</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              BiteOps se provee "tal cual" sin garantías de ningún tipo, expresas o implícitas.
              No garantizamos que el servicio estará libre de errores o interrupciones. En ningún
              caso seremos responsables por daños indirectos, incidentales o consecuentes derivados
              del uso de la plataforma.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Terminación del Servicio</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Nos reservamos el derecho de suspender o cancelar su acceso a la plataforma en caso
              de violación de estos términos, uso indebido del servicio o falta de pago. Usted
              puede cancelar su cuenta en cualquier momento desde la configuración de su perfil.
            </p>
          </div>

          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Ley Aplicable</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier
              controversia derivada del uso de la plataforma será sometida a la jurisdicción de los
              tribunales competentes de Montevideo, Uruguay.
            </p>
          </div>

        </div>
      </section>
    </main>

    <FooterSection />
  </div>
</template>
