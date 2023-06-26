import { Schema } from "mongoose";
import URL from "illuminate/utils/URL";
import Stripe from "stripe";

export interface IBillable {
  paymentMethod: string | null;
  getStripeCustomer(): Promise < Stripe.Customer >;
  updateStripeCustomer(data: Stripe.CustomerUpdateParams): Promise < Stripe.Customer >;
  addCard(card: Stripe.TokenCreateParams.CardData): Promise < Stripe.CustomerSource >;
  charge(amount: number, currency?: string, description?: string): Promise < Stripe.Charge >;
}

export default (schema: Schema) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  const assertCustomerExists = function(this: IBillable) {
    if (this.stripeId === null) {
      throw new Error(`This user is not a customer [${this}]`);
    }
  };

  schema.add({
    stripeId: {
      type: String,
      nullable: true
    }
  });

  schema.methods.getStripeCustomer = async function() {
    if (this.stripeId !== null) {
      return await stripe.customers.retrieve(this.stripeId);
    }

    const customer = await stripe.customers.create();
    this.stripeId = customer.id;
    await this.save();
    return customer;
  };

  schema.methods.updateStripeCustomer = async function(data: Stripe.CustomerUpdateParams) {
    assertCustomerExists.call(this);
    return await stripe.customers.update(this.stripeId, data);
  };

  schema.methods.addCard = async function(card: Stripe.TokenCreateParams.CardData) {
    assertCustomerExists.call(this);
    const token = await stripe.tokens.create({
      card
    });
    return await stripe.customers.createSource(this.stripeId, {
      source: token.id
    });
  };

  schema.methods.charge = async function(amount: number, currency = "usd", description = "") {
    assertCustomerExists.call(this);
    return await stripe.charges.create({
      customer: this.stripeId,
      amount: amount * 100,
      currency,
      description
    });
  };

  schema.methods.purchase = async function(productId: string, quantity: number) {
    assertCustomerExists.call(this);
    const product = await stripe.products.retrieve(productId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: product.default_price,
        quantity
      }],
      mode: 'payment',
      success_url: URL.client("/success"),
      cancel_url: URL.client("/cancel"),
    });
    return session.url;
  };
};