import express from "express";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Doctor } from "../models/Doctor.model.js";
import { Patient } from "../models/Patient.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { Admin } from "../models/Admin.model.js";
import { ROLES, STATUS } from "../utils/constants.js";
import {ENV} from "../config/env.js";

const router = express.Router();


router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = ENV.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return res.status(500).end();
    }

    // VERIFY WEBHOOK SIGNATURE
    const wh = new Webhook(secret);
    let event;
    try {
      event = wh.verify(req.body, {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      });
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const { type, data } = event;
    console.log(`Webhook received: ${type}`);

    try {
      switch (type) {
        case "user.created":
          await handleUserCreated(data);
          break;

        case "user.updated":
          await handleUserUpdated(data);
          break;

        case "user.deleted":
          await handleUserDeleted(data);
          break;

        default:
          console.log(`Unhandled webhook type: ${type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error(`Webhook handler error [${type}]:`, error.message);
      
      res.status(200).json({ received: true, warning: error.message });
    }
  },
);

async function handleUserCreated(data) {
  const { id: clerkUserId, email_addresses, unsafe_metadata } = data;
  const email = email_addresses?.[0]?.email_address;
  const role = unsafe_metadata?.role;

  if (!email || !role) {
    throw new Error(`Incomplete data: email=${email}, role=${role}`);
  }

  let mongoDoc;

  switch (role) {
    case ROLES.DOCTOR:
      mongoDoc = await Doctor.create({
        clerkUserId,
        email,
        fullName: unsafe_metadata.fullName,
        gender: unsafe_metadata.gender,
        speciality: unsafe_metadata.speciality,
        qualifications: unsafe_metadata.qualifications,
        clinicName: unsafe_metadata.clinicName,
        phone: unsafe_metadata.phone,
        address: {
          city: unsafe_metadata.city,
          area: unsafe_metadata.area,
          street: unsafe_metadata.street,
        },
        license: unsafe_metadata.license,
        status: STATUS.PENDING,
      });
      break;

    case ROLES.PHARMACY:
      mongoDoc = await Pharmacy.create({
        clerkUserId,
        email,
        fullName: unsafe_metadata.fullName,
        gender: unsafe_metadata.gender,
        pharmacyName: unsafe_metadata.pharmacyName,
        phone: unsafe_metadata.phone,
        address: {
          city: unsafe_metadata.city,
          area: unsafe_metadata.area,
          street: unsafe_metadata.street,
        },
        license: unsafe_metadata.license,
        status: STATUS.PENDING,
      });
      break;

    case ROLES.PATIENT:
      mongoDoc = await Patient.create({
        clerkUserId,
        email,
        fullName: unsafe_metadata.fullName,
        gender: unsafe_metadata.gender,
      });
      break;

    case ROLES.ADMIN:
      mongoDoc = await Admin.create({
        clerkUserId,
        email,
        name: unsafe_metadata.name,
      });
      break;

    default:
      throw new Error(`Role not recognized: ${role}`);
  }

  //   after creating the MongoDB document, we update the Clerk user metadata 
  //    with the role, status, and MongoDB ID.
  const status = role === ROLES.PATIENT || role === ROLES.ADMIN ? STATUS.ACTIVE : STATUS.PENDING;

  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      role,
      status,
      mongoId: mongoDoc._id.toString(),
    },
   
    unsafeMetadata: {},
  });

  console.log(`User created: [${role}] ${email} → status: ${status}`);
}

async function handleUserUpdated(data) {
  const { id: clerkUserId, email_addresses } = data;
  const email = email_addresses?.[0]?.email_address;
  if (!email) return;

 
  const role = data.public_metadata?.role;
  const modelMap = {
    [ROLES.DOCTOR]: Doctor,
    [ROLES.PATIENT]: Patient,
    [ROLES.PHARMACY]: Pharmacy,
    [ROLES.ADMIN]: Admin,
  };

  const Model = modelMap[role];
  if (Model) {
    await Model.findOneAndUpdate({ clerkUserId }, { email });
    console.log(`User updated: ${clerkUserId}`);
  }
}

async function handleUserDeleted(data) {
  const { id: clerkUserId } = data;

 
  await Promise.allSettled([
    Doctor.findOneAndDelete({ clerkUserId }),
    Patient.findOneAndDelete({ clerkUserId }),
    Pharmacy.findOneAndDelete({ clerkUserId }),
    Admin.findOneAndDelete({ clerkUserId }),
  ]);

  console.log(`User deleted: ${clerkUserId}`);
}

export default router;
