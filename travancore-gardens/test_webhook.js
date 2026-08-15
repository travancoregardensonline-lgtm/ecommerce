const { Webhook } = require('./node_modules/standardwebhooks');
try {
    const rawSecret = 'v1,whsec_SpoNBcopcTbW/iJ89rFGHTUvFxqV+IRM';
    const hookSecret = rawSecret.replace('v1,whsec_', '');
    console.log("Hook secret after replace:", hookSecret);
    const wh = new Webhook(hookSecret);
    console.log("Success");
} catch (e) {
    console.error("Error:", e.message);
}
