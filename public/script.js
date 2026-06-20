const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const enquiryForm = document.querySelector('.enquiry-form');
const formStatus = document.querySelector('#form-status');
const enquiryType = document.querySelector('#enquiry-type');
const statusCode = new URLSearchParams(window.location.search).get('status');

if (formStatus && statusCode) {
  const messages = {
    success: ['success', 'Thank you. Your enquiry has been sent and our team will respond soon.'],
    invalid: ['error', 'Please check the required fields and try again.'],
    error: ['error', 'We could not send the form. Please use one of the email links below.']
  };
  const status = messages[statusCode] || messages.error;
  formStatus.classList.add(status[0]);
  formStatus.textContent = status[1];
}

if (enquiryForm) {
  const syncAction = () => {
    const isCustomer = enquiryType && enquiryType.value === 'customer-care';
    enquiryForm.action = isCustomer
      ? 'https://formsubmit.co/customercare@mentisgate.online'
      : 'https://formsubmit.co/partnerships@mentisgate.online';
  };

  if (enquiryType) {
    enquiryType.addEventListener('change', syncAction);
    syncAction();
  }

  const validateMessage = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 20) return 'Please add a little more detail to your message.';
    if (/(https?:\/\/|www\.|free money|crypto|loan|casino|winner|click here)/i.test(trimmed)) {
      return 'Please remove links or spam-like text from the message.';
    }
    return '';
  };

  enquiryForm.addEventListener('submit', (event) => {
    const data = new FormData(enquiryForm);
    const issues = [];

    if (!String(data.get('name') || '').trim().match(/^[A-Za-z][A-Za-z\s.'-]{1,}$/)) {
      issues.push('Please enter a valid name.');
    }

    if (!String(data.get('email') || '').trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      issues.push('Please enter a valid email address.');
    }

    if (!String(data.get('phone') || '').trim().match(/^[0-9+()\-\s]{10,20}$/)) {
      issues.push('Please enter a valid phone number.');
    }

    if (String(data.get('organization') || '').trim().length < 3) {
      issues.push('Please enter a valid organization name.');
    }

    const messageError = validateMessage(String(data.get('message') || ''));
    if (messageError) issues.push(messageError);

    if (String(data.get('website') || '').trim()) {
      issues.push('Form validation failed.');
    }

    if (issues.length) {
      event.preventDefault();
      formStatus.className = 'form-status error';
      formStatus.textContent = issues[0];
      return;
    }

    syncAction();
    formStatus.className = 'form-status success';
    formStatus.textContent = 'Sending your enquiry now.';
  });
}
