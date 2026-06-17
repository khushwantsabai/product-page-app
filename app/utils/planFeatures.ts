// Define plan features configuration

export const planFeatures = {
  free: {
    name: 'Free',
    price: 0,
    pageLimit: 1,
    templates: ['template-free-1'],
    features: ['basic-controls', 'edit-title']
  },
  basic: {
    name: 'Basic',
    price: 20,
    pageLimit: 5,
    templates: ['template-free-1', 'template-basic-1', 'template-basic-2'],
    features: ['basic-controls', 'edit-title', 'fonts', 'bg-colors', 'stock-warning']
  },
  standard: {
    name: 'Standard',
    price: 35,
    pageLimit: 15,
    templates: ['template-free-1', 'template-basic-1', 'template-basic-2', 'template-standard-1', 'template-standard-2'],
    features: ['basic-controls', 'edit-title', 'fonts', 'bg-colors', 'stock-warning', 'reviews', 'delivery-date', 'advanced-styling']
  },
  premium: {
    name: 'Premium',
    price: 60,
    pageLimit: -1, // Unlimited
    templates: ['all'],
    features: ['basic-controls', 'edit-title', 'fonts', 'bg-colors', 'stock-warning', 'reviews', 'delivery-date', 'advanced-styling', 'video', 'related-products', 'ab-testing', 'analytics']
  }
};

export const hasAccessToFeature = (planId: string, feature: string) => {
  const plan = planFeatures[planId as keyof typeof planFeatures];
  if (!plan) return false;
  return plan.features.includes(feature) || plan.features.includes('all');
};
