
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold">Политика конфиденциальности</h1>
        <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
          Последнее обновление: 27 февраля 2026 г.
        </p>
      </header>

      <div className="space-y-10 text-[15px] leading-relaxed text-gray-700">
        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">1. Общие положения</h2>
          <p>
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта Аязбековой Сабины (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями данной Политики.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">2. Какие данные мы собираем</h2>
          <p>При использовании Сайта мы можем собирать следующие данные:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Имя и адрес электронной почты — при заполнении контактной формы</li>
            <li>Адрес электронной почты — при оформлении покупки электронных книг</li>
            <li>Техническая информация — IP-адрес, тип браузера, время посещения (автоматически)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">3. Цели обработки данных</h2>
          <p>Персональные данные используются исключительно для:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Обработки и выполнения заказов на электронные книги</li>
            <li>Ответа на обращения через контактную форму</li>
            <li>Отправки ссылки для скачивания приобретённых материалов</li>
            <li>Улучшения работы Сайта</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">4. Обработка платежей</h2>
          <p>
            Оплата на Сайте осуществляется через платёжный сервис Robokassa. Мы не храним данные банковских карт. Вся платёжная информация обрабатывается непосредственно Robokassa в соответствии с их политикой безопасности и стандартами PCI DSS.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">5. Хранение и защита данных</h2>
          <p>
            Мы принимаем необходимые технические и организационные меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Данные хранятся на защищённых серверах и доступ к ним строго ограничен.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">6. Передача данных третьим лицам</h2>
          <p>
            Мы не продаём, не обмениваем и не передаём персональные данные третьим лицам, за исключением случаев, необходимых для выполнения заказов (например, передача данных платёжному сервису Robokassa) или предусмотренных законодательством.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">7. Файлы cookie</h2>
          <p>
            Сайт может использовать файлы cookie для обеспечения корректной работы и улучшения пользовательского опыта. Вы можете отключить cookie в настройках вашего браузера, однако это может повлиять на функциональность Сайта.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">8. Права пользователей</h2>
          <p>Вы имеете право:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Запросить информацию о хранящихся персональных данных</li>
            <li>Потребовать исправления или удаления своих данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
          </ul>
          <p>
            Для реализации этих прав свяжитесь с нами через контактную форму на Сайте.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">9. Изменения в политике</h2>
          <p>
            Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Актуальная версия всегда доступна на данной странице. Рекомендуем периодически проверять эту страницу для ознакомления с обновлениями.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-black">10. Контактная информация</h2>
          <p>
            По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться через раздел «Контакты» на Сайте.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
