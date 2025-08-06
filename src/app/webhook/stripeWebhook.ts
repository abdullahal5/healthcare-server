import Stripe from "stripe";
import config from "../../config";
import { Request, Response } from "express";
import { prisma } from "../../shared/prisma";

const stripe = new Stripe(config.stripe.stripe_secret_key!, {
  apiVersion: "2025-07-30.basil",
  typescript: true,
});

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"]!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.stripe_webhook_key!
    );
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (
      !session.metadata ||
      !session.metadata.appointmentId ||
      !session.metadata.transactionId
    ) {
      console.error("Missing metadata in Stripe session");
      res.status(400).send("Missing metadata");
      return;
    }

    const appointmentId = session.metadata.appointmentId;
    const transactionId = session.metadata.transactionId;

    await prisma.payment.update({
      where: { transactionId },
      data: {
        status: "PAID",
        paymentGatewayData: JSON.parse(JSON.stringify(session)),
      },
    });

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: "PAID" },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const session = event.data.object;

    if (!session.metadata || !session.metadata.transactionId) {
      console.error("Missing metadata in Stripe session");
      res.status(400).send("Missing metadata");
      return;
    }

    const transactionId = session.metadata.transactionId;

    await prisma.payment.update({
      where: { transactionId },
      data: { status: "FAILED" },
    });
  }

  res.status(200).json({ received: true });
};