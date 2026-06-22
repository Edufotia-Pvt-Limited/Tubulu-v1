--
-- PostgreSQL database dump
--


-- Dumped from database version 14.22 (Homebrew)
-- Dumped by pg_dump version 14.22 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: enum_AdminStaffs_role; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_AdminStaffs_role" AS ENUM (
    'manager',
    'cashier',
    'support',
    'delivery'
);


ALTER TYPE public."enum_AdminStaffs_role" OWNER TO tubulu_admin;

--
-- Name: enum_CampaignTemplates_status; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_CampaignTemplates_status" AS ENUM (
    'APPROVED',
    'PENDING'
);


ALTER TYPE public."enum_CampaignTemplates_status" OWNER TO tubulu_admin;

--
-- Name: enum_Campaigns_status; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Campaigns_status" AS ENUM (
    'DRAFT',
    'COMPLETED',
    'ACTIVE',
    'SCHEDULED',
    'CANCELLED'
);


ALTER TYPE public."enum_Campaigns_status" OWNER TO tubulu_admin;

--
-- Name: enum_Campaigns_type; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Campaigns_type" AS ENUM (
    'SCHEDULED',
    'IMMEDIATE'
);


ALTER TYPE public."enum_Campaigns_type" OWNER TO tubulu_admin;

--
-- Name: enum_Catalogues_displayType; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Catalogues_displayType" AS ENUM (
    'Grid View',
    'List View'
);


ALTER TYPE public."enum_Catalogues_displayType" OWNER TO tubulu_admin;

--
-- Name: enum_ChatMessages_sender; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_ChatMessages_sender" AS ENUM (
    'user',
    'assistant',
    'system'
);


ALTER TYPE public."enum_ChatMessages_sender" OWNER TO tubulu_admin;

--
-- Name: enum_Deals_couponType; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Deals_couponType" AS ENUM (
    'store_coupon',
    'payment_coupon'
);


ALTER TYPE public."enum_Deals_couponType" OWNER TO tubulu_admin;

--
-- Name: enum_Deals_discountType; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Deals_discountType" AS ENUM (
    'percentage',
    'flat',
    'bogo'
);


ALTER TYPE public."enum_Deals_discountType" OWNER TO tubulu_admin;

--
-- Name: enum_Integrations_role; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Integrations_role" AS ENUM (
    'super_admin',
    'merchant_admin',
    'ops_admin',
    'onboarding_specialist',
    'content_moderator',
    'finance_admin',
    'regional_partner'
);


ALTER TYPE public."enum_Integrations_role" OWNER TO tubulu_admin;

--
-- Name: enum_Integrations_verticalType; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Integrations_verticalType" AS ENUM (
    'FB',
    'RETAIL',
    'TICKETING',
    'SERVICES',
    'GROCERY',
    'GOVT',
    'TECH',
    'AI'
);


ALTER TYPE public."enum_Integrations_verticalType" OWNER TO tubulu_admin;

--
-- Name: enum_LoyaltyTransactions_type; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_LoyaltyTransactions_type" AS ENUM (
    'earn',
    'redeem',
    'referral_bonus'
);


ALTER TYPE public."enum_LoyaltyTransactions_type" OWNER TO tubulu_admin;

--
-- Name: enum_MerchantMemberships_role; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_MerchantMemberships_role" AS ENUM (
    'OWNER',
    'MANAGER',
    'CASHIER'
);


ALTER TYPE public."enum_MerchantMemberships_role" OWNER TO tubulu_admin;

--
-- Name: enum_Orders_paymentStatus; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Orders_paymentStatus" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE public."enum_Orders_paymentStatus" OWNER TO tubulu_admin;

--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'waiting',
    'accepted',
    'packing',
    'dispatched',
    'delivered',
    'canceled'
);


ALTER TYPE public."enum_Orders_status" OWNER TO tubulu_admin;

--
-- Name: enum_SupportTickets_priority; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_SupportTickets_priority" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public."enum_SupportTickets_priority" OWNER TO tubulu_admin;

--
-- Name: enum_SupportTickets_status; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public."enum_SupportTickets_status" AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);


ALTER TYPE public."enum_SupportTickets_status" OWNER TO tubulu_admin;

--
-- Name: enum_chat_documents_sender; Type: TYPE; Schema: public; Owner: tubulu_admin
--

CREATE TYPE public.enum_chat_documents_sender AS ENUM (
    'user',
    'assistant'
);


ALTER TYPE public.enum_chat_documents_sender OWNER TO tubulu_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AICategoryPlaybooks; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."AICategoryPlaybooks" (
    id uuid NOT NULL,
    "categoryKey" character varying(255) NOT NULL,
    "displayName" character varying(255) NOT NULL,
    "masterPrompt" text NOT NULL,
    "requiredAttributes" jsonb DEFAULT '[]'::jsonb,
    "actionConfig" jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AICategoryPlaybooks" OWNER TO tubulu_admin;

--
-- Name: AdminStaffs; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."AdminStaffs" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role public."enum_AdminStaffs_role" DEFAULT 'support'::public."enum_AdminStaffs_role",
    permissions jsonb DEFAULT '{"canManageOrders": true, "canManageProducts": false}'::jsonb,
    "isActive" boolean DEFAULT true,
    "lastLoginAt" timestamp with time zone,
    "delegatedToStaffId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AdminStaffs" OWNER TO tubulu_admin;

--
-- Name: Advertisements; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Advertisements" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text DEFAULT ''::text,
    "bannerUrl" character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false,
    "isDeleted" boolean DEFAULT false,
    "integrationId" uuid NOT NULL,
    "mongoId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "targetCity" character varying(255),
    "targetState" character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    radius integer
);


ALTER TABLE public."Advertisements" OWNER TO tubulu_admin;

--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."AuditLogs" (
    id uuid NOT NULL,
    "staffId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    action character varying(255) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AuditLogs" OWNER TO tubulu_admin;

--
-- Name: BlockedIntegrations; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."BlockedIntegrations" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."BlockedIntegrations" OWNER TO tubulu_admin;

--
-- Name: CampaignTemplates; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."CampaignTemplates" (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    "mediaType" character varying(255),
    "mediaURL" character varying(255),
    "messageBody" text,
    "messageActions" jsonb DEFAULT '[]'::jsonb,
    "integrationId" uuid NOT NULL,
    status public."enum_CampaignTemplates_status" DEFAULT 'PENDING'::public."enum_CampaignTemplates_status",
    payload jsonb DEFAULT '{}'::jsonb,
    variables jsonb DEFAULT '[]'::jsonb,
    "isDeleted" boolean DEFAULT false,
    "deletedAt" timestamp with time zone,
    "mongoId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CampaignTemplates" OWNER TO tubulu_admin;

--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Campaigns" (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    type public."enum_Campaigns_type",
    "templateId" uuid NOT NULL,
    "scheduledTime" timestamp with time zone,
    "phoneBookId" uuid,
    users jsonb DEFAULT '[]'::jsonb,
    "integrationId" uuid NOT NULL,
    status public."enum_Campaigns_status" NOT NULL,
    "phoneBookIds" jsonb DEFAULT '[]'::jsonb,
    "deletedAt" timestamp with time zone,
    variables jsonb DEFAULT '[]'::jsonb,
    "mongoId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Campaigns" OWNER TO tubulu_admin;

--
-- Name: Carts; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Carts" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "catalogueId" character varying(255),
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    "appliedDeals" jsonb DEFAULT '[]'::jsonb,
    "totalQuantity" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Carts" OWNER TO tubulu_admin;

--
-- Name: Catalogues; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Catalogues" (
    id character varying(255) NOT NULL,
    "integrationId" uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "displayType" character varying(255),
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isDeleted" boolean DEFAULT false,
    "mongoId" character varying(255)
);


ALTER TABLE public."Catalogues" OWNER TO tubulu_admin;

--
-- Name: ChatMessages; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."ChatMessages" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "chatRoomId" uuid NOT NULL,
    sender public."enum_ChatMessages_sender" NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatMessages" OWNER TO tubulu_admin;

--
-- Name: ChatRooms; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."ChatRooms" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "lastMessage" text,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "isAiActive" boolean DEFAULT true
);


ALTER TABLE public."ChatRooms" OWNER TO tubulu_admin;

--
-- Name: Cities; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Cities" (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    "stateId" uuid NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Cities" OWNER TO tubulu_admin;

--
-- Name: Countries; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Countries" (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(10) NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Countries" OWNER TO tubulu_admin;

--
-- Name: Customizations; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Customizations" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "integrationId" uuid NOT NULL,
    "customizationName" character varying(255) NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    "isActive" boolean DEFAULT true,
    "isDeleted" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Customizations" OWNER TO tubulu_admin;

--
-- Name: Deals; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Deals" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "integrationId" uuid,
    name character varying(255) NOT NULL,
    descriptions jsonb DEFAULT '[]'::jsonb,
    "discountType" public."enum_Deals_discountType" NOT NULL,
    "couponCode" character varying(255),
    "couponType" public."enum_Deals_couponType" DEFAULT 'store_coupon'::public."enum_Deals_couponType",
    "discountValue" double precision DEFAULT '0'::double precision,
    "buyQuantity" integer DEFAULT 0,
    "getQuantity" integer DEFAULT 0,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    "minOrderValue" double precision DEFAULT '0'::double precision,
    "maxDiscount" double precision DEFAULT '0'::double precision,
    "usageLimit" integer DEFAULT 0,
    "perUserLimit" integer DEFAULT 0,
    "isDealOfTheDay" boolean DEFAULT false,
    "isDeleted" boolean DEFAULT false,
    "isActive" boolean DEFAULT false,
    "usageCount" integer DEFAULT 0,
    "catalogueId" character varying(255),
    "appliesOnProducts" jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Deals" OWNER TO tubulu_admin;

--
--




--
-- Name: IntegrationDocuments; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."IntegrationDocuments" (
    id uuid NOT NULL,
    uuid character varying(255) NOT NULL,
    "integrationId" uuid NOT NULL,
    "documentUrl" character varying(255) NOT NULL,
    "documentName" character varying(255) NOT NULL,
    "documentOriginalName" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."IntegrationDocuments" OWNER TO tubulu_admin;

--
-- Name: IntegrationFBs; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."IntegrationFBs" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "prepTimeMinutes" integer DEFAULT 0,
    "cuisineType" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."IntegrationFBs" OWNER TO tubulu_admin;

--
-- Name: IntegrationGroceries; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."IntegrationGroceries" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "organicCert" character varying(255),
    "deliverySlots" jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."IntegrationGroceries" OWNER TO tubulu_admin;

--
-- Name: IntegrationRetails; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."IntegrationRetails" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "returnPolicyDays" integer DEFAULT 0,
    "shippingRates" numeric(10,2) DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."IntegrationRetails" OWNER TO tubulu_admin;

--
-- Name: Integrations; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Integrations" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    logo character varying(255),
    "integrationName" character varying(255),
    "apiUrl" character varying(255),
    "chatBaseUrl" character varying(255),
    description text,
    "webhookUrl" character varying(255),
    "apiAuthKey" character varying(255),
    "welcomeMessagePayLoad" jsonb DEFAULT '{}'::jsonb,
    "phoneNumber" character varying(255),
    email character varying(255),
    category character varying(255) DEFAULT 'AI'::character varying,
    "isActive" boolean DEFAULT true,
    "isApproved" boolean DEFAULT false,
    "isOnboarded" boolean DEFAULT false,
    "addressLine" character varying(255),
    city character varying(255),
    state character varying(255),
    country character varying(255),
    pincode character varying(255),
    landmark character varying(255),
    "gstNumber" character varying(255),
    "panNumber" character varying(255),
    "aadharNumber" character varying(255),
    razorpay jsonb DEFAULT '{}'::jsonb,
    "cdpAccessToken" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    website character varying(255),
    "isDocumentsUploaded" boolean DEFAULT false,
    "isTubuluAppSetupDone" boolean DEFAULT false,
    "shopEstablishmentNumber" character varying(255),
    "verticalType" public."enum_Integrations_verticalType" DEFAULT 'FB'::public."enum_Integrations_verticalType",
    capabilities jsonb DEFAULT '{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}'::jsonb,
    "phoneNumberOtp" character varying(255),
    "phoneVerificationExpiry" timestamp with time zone,
    documents jsonb DEFAULT '[]'::jsonb,
    role public."enum_Integrations_role" DEFAULT 'merchant_admin'::public."enum_Integrations_role",
    "emailOtp" character varying(255),
    "emailVerificationExpiry" timestamp with time zone,
    "parentId" uuid,
    upi jsonb DEFAULT '{"vpa": "", "connected": false, "merchantName": ""}'::jsonb,
    "assignedCity" character varying(255),
    "commissionRate" numeric(5,2) DEFAULT 0,
    "trustScore" integer DEFAULT 0,
    "isGstVerified" boolean DEFAULT false,
    "isPanVerified" boolean DEFAULT false,
    "isAadharVerified" boolean DEFAULT false,
    "pstnDID" character varying(255),
    "sarvamApiKey" character varying(255),
    "isSuspended" boolean DEFAULT false,
    "openingHours" jsonb DEFAULT '{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}'::jsonb,
    "bannerImage" text,
    "deliveryFee" numeric(10,2) DEFAULT 0,
    "minimumOrderValue" numeric(10,2) DEFAULT 0,
    "estimatedDeliveryTime" integer DEFAULT 30,
    "countryId" uuid,
    "stateId" uuid,
    "cityId" uuid,
    "receiptSettings" jsonb DEFAULT '{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}'::jsonb,
    "geminiApiKey" character varying(255)
);


ALTER TABLE public."Integrations" OWNER TO tubulu_admin;

--
-- Name: LoyaltyTransactions; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."LoyaltyTransactions" (
    id uuid NOT NULL,
    "walletId" uuid NOT NULL,
    type public."enum_LoyaltyTransactions_type" NOT NULL,
    points integer NOT NULL,
    "orderId" uuid,
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."LoyaltyTransactions" OWNER TO tubulu_admin;

--
-- Name: MerchantMemberships; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."MerchantMemberships" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    role public."enum_MerchantMemberships_role" DEFAULT 'CASHIER'::public."enum_MerchantMemberships_role" NOT NULL,
    permissions jsonb DEFAULT '{"canEditPricing": false, "canManageStaff": false, "canEditCatalogue": false, "canViewSettlements": false}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."MerchantMemberships" OWNER TO tubulu_admin;

--
-- Name: Orders; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Orders" (
    id uuid NOT NULL,
    "mongoId" character varying(255),
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "cartId" character varying(255),
    "catalogueId" character varying(255),
    "addressId" character varying(255),
    "orderItems" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "discountAmount" double precision DEFAULT '0'::double precision,
    "totalPrice" double precision DEFAULT '0'::double precision,
    "totalQuantity" integer DEFAULT 0,
    "orderMessage" text,
    "deliveryType" jsonb DEFAULT '[]'::jsonb,
    "paymentStatus" public."enum_Orders_paymentStatus" DEFAULT 'pending'::public."enum_Orders_paymentStatus",
    "paymentMethod" character varying(255) DEFAULT 'cod'::character varying,
    "razorpayOrderId" character varying(255),
    status public."enum_Orders_status" DEFAULT 'waiting'::public."enum_Orders_status",
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "statusLogs" jsonb DEFAULT '[]'::jsonb,
    "acceptedAt" timestamp with time zone,
    "packedAt" timestamp with time zone,
    "dispatchedAt" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "personalNote" text,
    "scheduledFor" timestamp with time zone,
    "isRated" boolean DEFAULT false,
    "cancelReason" text
);


ALTER TABLE public."Orders" OWNER TO tubulu_admin;

--
-- Name: PhoneBookGroupRelations; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."PhoneBookGroupRelations" (
    id uuid NOT NULL,
    "phoneBookId" uuid NOT NULL,
    "groupId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PhoneBookGroupRelations" OWNER TO tubulu_admin;

--
-- Name: PhoneBookGroups; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."PhoneBookGroups" (
    id uuid NOT NULL,
    "groupName" character varying(255) NOT NULL,
    uuid character varying(255) NOT NULL,
    "integrationId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PhoneBookGroups" OWNER TO tubulu_admin;

--
-- Name: PhoneBooks; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."PhoneBooks" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    uuid character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PhoneBooks" OWNER TO tubulu_admin;

--
-- Name: Products; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Products" (
    id character varying(255) NOT NULL,
    "catalogueId" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price double precision DEFAULT '0'::double precision,
    currency character varying(255) DEFAULT 'INR'::character varying,
    "imageUrls" jsonb DEFAULT '[]'::jsonb,
    sku character varying(255) NOT NULL,
    quantity integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "isDeleted" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "discountPrice" double precision DEFAULT '0'::double precision,
    category character varying(255),
    subcategory character varying(255),
    specifications jsonb DEFAULT '{}'::jsonb,
    "integrationId" uuid NOT NULL,
    "dietaryType" character varying(20) DEFAULT 'veg'::character varying,
    "isBestseller" boolean DEFAULT false,
    "preparationTime" integer DEFAULT 15,
    "variantsConfig" jsonb DEFAULT '[]'::jsonb,
    "mongoId" character varying(255),
    "customizationId" uuid,
    "nutritionData" jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Products" OWNER TO tubulu_admin;

--
-- Name: QRCategories; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."QRCategories" (
    id uuid NOT NULL,
    uuid character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    "integrationId" uuid NOT NULL,
    "mongoId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QRCategories" OWNER TO tubulu_admin;

--
-- Name: QRCodes; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."QRCodes" (
    id uuid NOT NULL,
    uuid character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    "subTitle" character varying(255),
    "categoryId" uuid NOT NULL,
    "groupId" uuid,
    "welcomeMessage" text,
    "welcomeMessageDocument" character varying(255),
    "qrCodeURL" character varying(255),
    "integrationId" uuid NOT NULL,
    "scanCount" integer DEFAULT 0,
    "phoneBookGroups" jsonb DEFAULT '[]'::jsonb,
    "deletedAt" timestamp with time zone,
    "mongoId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."QRCodes" OWNER TO tubulu_admin;

--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Reviews" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    rating integer,
    "reviewText" text,
    "isPublicToContacts" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "Reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public."Reviews" OWNER TO tubulu_admin;

--
-- Name: Settlements; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Settlements" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(255) DEFAULT 'INR'::character varying,
    status character varying(255) DEFAULT 'pending'::character varying,
    utr character varying(255),
    "settlementDate" timestamp with time zone,
    "payoutId" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    type character varying(255) DEFAULT 'payout'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public."Settlements" OWNER TO tubulu_admin;

--
-- Name: States; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."States" (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    "countryId" uuid NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "sarvamApiKey" character varying(255),
    "geminiApiKey" character varying(255),
    "voiceProvider" character varying(50) DEFAULT 'sarvam'::character varying,
    "chatProvider" character varying(50) DEFAULT 'gemini'::character varying
);


ALTER TABLE public."States" OWNER TO tubulu_admin;

--
-- Name: SupportTickets; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."SupportTickets" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "orderId" uuid,
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    status public."enum_SupportTickets_status" DEFAULT 'open'::public."enum_SupportTickets_status",
    priority public."enum_SupportTickets_priority" DEFAULT 'medium'::public."enum_SupportTickets_priority",
    attachments jsonb DEFAULT '[]'::jsonb,
    "resolvedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    replies jsonb DEFAULT '[]'::jsonb,
    category character varying(255) DEFAULT 'General'::character varying
);


ALTER TABLE public."SupportTickets" OWNER TO tubulu_admin;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."SystemSettings" (
    id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL,
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."SystemSettings" OWNER TO tubulu_admin;

--
-- Name: UserContacts; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."UserContacts" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "contactPhoneNumber" character varying(255) NOT NULL,
    "contactName" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserContacts" OWNER TO tubulu_admin;

--
-- Name: UserDealUsages; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."UserDealUsages" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "dealId" uuid NOT NULL,
    "usageCount" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserDealUsages" OWNER TO tubulu_admin;

--
-- Name: UserDevices; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."UserDevices" (
    id uuid NOT NULL,
    uuid character varying(255) NOT NULL,
    "userId" uuid NOT NULL,
    "fcmToken" jsonb DEFAULT '[]'::jsonb,
    "socketId" jsonb DEFAULT '[]'::jsonb,
    "isOnline" boolean DEFAULT false,
    "lastOnlineAt" character varying(255) DEFAULT ''::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserDevices" OWNER TO tubulu_admin;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    "profilePictureUrl" character varying(255),
    uuid character varying(255) NOT NULL,
    password character varying(255),
    "userName" character varying(255),
    "firstName" character varying(255),
    "lastName" character varying(255),
    email character varying(255),
    "phoneNumber" character varying(255) NOT NULL,
    cc character varying(255) DEFAULT '+91'::character varying,
    role character varying(255) DEFAULT 'User'::character varying,
    "lastLoginAt" character varying(255),
    "userVerified" boolean DEFAULT false,
    otp character varying(255),
    "otpExpiry" character varying(255),
    "fcmToken" character varying(255),
    location character varying(255),
    city character varying(255),
    state character varying(255),
    "pinCode" character varying(255),
    addresses jsonb DEFAULT '[]'::jsonb,
    "cdpDetails" jsonb DEFAULT '[]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "mongoId" character varying(255),
    "portfolioAccess" jsonb DEFAULT '{"merchants": [], "verticals": [], "accessType": "GLOBAL"}'::jsonb,
    status character varying(255) DEFAULT 'offline'::character varying,
    "scopedCountryId" uuid,
    "scopedStateId" uuid,
    "scopedCityId" uuid
);


ALTER TABLE public."Users" OWNER TO tubulu_admin;

--
-- Name: VendorAIConfigs; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."VendorAIConfigs" (
    id uuid NOT NULL,
    "integrationId" uuid NOT NULL,
    "masterPrompt" text,
    "faqContext" jsonb DEFAULT '[]'::jsonb,
    "isActive" boolean DEFAULT false,
    "catalogScoped" boolean DEFAULT true,
    "modelName" character varying(255) DEFAULT 'gpt-3.5-turbo'::character varying,
    temperature double precision DEFAULT '0.7'::double precision,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."VendorAIConfigs" OWNER TO tubulu_admin;

--
-- Name: COLUMN "VendorAIConfigs"."masterPrompt"; Type: COMMENT; Schema: public; Owner: tubulu_admin
--

COMMENT ON COLUMN public."VendorAIConfigs"."masterPrompt" IS 'The core personality and guidelines (The Brain)';


--
-- Name: COLUMN "VendorAIConfigs"."faqContext"; Type: COMMENT; Schema: public; Owner: tubulu_admin
--

COMMENT ON COLUMN public."VendorAIConfigs"."faqContext" IS 'Array of { question: string, answer: string }';


--
-- Name: COLUMN "VendorAIConfigs"."catalogScoped"; Type: COMMENT; Schema: public; Owner: tubulu_admin
--

COMMENT ON COLUMN public."VendorAIConfigs"."catalogScoped" IS 'If true, AI will strictly use catalogue data';


--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public."Wallets" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    points integer DEFAULT 0,
    "cashBalance" numeric(10,2) DEFAULT 0,
    "referralCode" character varying(255),
    "referredBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Wallets" OWNER TO tubulu_admin;

--
-- Name: chat_documents; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public.chat_documents (
    id uuid NOT NULL,
    "chatRoomId" uuid NOT NULL,
    "userId" uuid,
    "integrationId" uuid,
    "fileUrl" text,
    "fileName" character varying(255),
    "mimeType" character varying(255),
    "fileSize" integer,
    sender public.enum_chat_documents_sender DEFAULT 'user'::public.enum_chat_documents_sender,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.chat_documents OWNER TO tubulu_admin;

--
-- Name: message_bookmarks; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public.message_bookmarks (
    id uuid NOT NULL,
    uuid character varying(255),
    "userId" uuid NOT NULL,
    "chatRoomId" uuid NOT NULL,
    "chatMessageId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.message_bookmarks OWNER TO tubulu_admin;

--
-- Name: message_notes; Type: TABLE; Schema: public; Owner: tubulu_admin
--

CREATE TABLE public.message_notes (
    id uuid NOT NULL,
    uuid character varying(255),
    "userId" uuid NOT NULL,
    "chatRoomId" uuid NOT NULL,
    "chatMessageId" uuid,
    "noteMessage" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.message_notes OWNER TO tubulu_admin;

--
-- Data for Name: AICategoryPlaybooks; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."AICategoryPlaybooks" (id, "categoryKey", "displayName", "masterPrompt", "requiredAttributes", "actionConfig", "createdAt", "updatedAt") FROM stdin;
0ffe28d9-1cbb-46be-b558-f0d1662232d5	FB	Food & Beverage	You are an AI assistant for a restaurant. Help users browse the menu, answer diet questions, and encourage placing orders.	["cuisine", "spicyLevel", "vegNonVeg"]	{"hasCart": true, "hasTableBooking": true}	2026-05-10 10:28:47.716+05:30	2026-05-10 10:28:47.716+05:30
a1435a04-cb35-44e7-9b38-25e07158a56a	GROCERY	Grocery & Essentials	You are an AI assistant for a grocery store. Help users find daily essentials, verify stocks, and maintain organized carts.	["brand", "expiry", "weight"]	{"hasCart": true}	2026-05-10 10:28:47.751+05:30	2026-05-10 10:28:47.751+05:30
91046a7b-8401-4d6a-86f4-a352f2de0065	SERVICES	Professional Services	You are an AI assistant for a service provider. Schedule appointments, describe your specialized expertise, and secure calendar slots.	["duration", "expertName"]	{"hasSeatSelection": true}	2026-05-10 10:28:47.753+05:30	2026-05-10 10:28:47.753+05:30
c14a9d7e-1020-4a5c-bd23-e60e026e5c03	RETAIL	Retail & E-commerce	You are a retail AI assistant. Highlight trending collections, resolve size inquiries, and push upsells.	["sizeChart", "material"]	{"hasCart": true}	2026-05-10 10:28:47.754+05:30	2026-05-10 10:28:47.754+05:30
\.


--
-- Data for Name: AdminStaffs; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."AdminStaffs" (id, "integrationId", name, email, role, permissions, "isActive", "lastLoginAt", "delegatedToStaffId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Advertisements; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Advertisements" (id, name, description, "bannerUrl", "isActive", "isDeleted", "integrationId", "mongoId", "createdAt", "updatedAt", "targetCity", "targetState", latitude, longitude, radius) FROM stdin;
bd45e8ed-d59d-43c8-ad30-6c6e7578403c	50% offer on all the products	login to the app and claim your offer	https://placehold.co/600x400?text=Ad	t	f	908fa830-7d67-4555-8d3b-a72b20636d44	\N	2026-05-16 18:28:47.911+05:30	2026-05-16 18:34:27.242+05:30	\N	\N	\N	\N	\N
09814ecf-761e-4b33-9ae1-6d4e44010011	Admin Mega Sale	Exclusive offers from the platform	https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop	t	f	832d3a09-2688-4891-a6fc-526fe96f298c	\N	2026-05-16 19:59:51.199+05:30	2026-05-16 19:59:51.199+05:30	\N	\N	\N	\N	\N
5a7f3168-114e-45c8-9a57-8a8141ff02c1	50% off on dosa	50% off on dosa	https://placehold.co/600x400?text=Ad	f	t	1f6b2343-2619-429e-b843-dfda8ed66949	\N	2026-05-27 09:41:09.925+05:30	2026-05-27 09:45:18.859+05:30	\N	\N	\N	\N	\N
9f964a00-f4bb-4f2c-9d49-ef47bda5fb29	50% offer	offer	https://placehold.co/600x400?text=Ad	f	t	6c858926-3ba4-4c6c-9cce-e134b4a77a20	\N	2026-05-30 20:33:51.509+05:30	2026-05-30 20:53:48.754+05:30	Mysuru	Karnataka	\N	\N	\N
feeb0a73-5304-498e-8c05-2736daa7567a	50% offer	limited time	https://placehold.co/600x400?text=Ad	f	t	6c858926-3ba4-4c6c-9cce-e134b4a77a20	\N	2026-05-30 20:54:01.939+05:30	2026-05-30 20:54:33.354+05:30	Mysuru	Karnataka	\N	\N	\N
\.


--
-- Data for Name: AuditLogs; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."AuditLogs" (id, "staffId", "integrationId", action, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: BlockedIntegrations; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."BlockedIntegrations" (id, "integrationId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CampaignTemplates; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."CampaignTemplates" (id, title, "mediaType", "mediaURL", "messageBody", "messageActions", "integrationId", status, payload, variables, "isDeleted", "deletedAt", "mongoId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Campaigns; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Campaigns" (id, title, type, "templateId", "scheduledTime", "phoneBookId", users, "integrationId", status, "phoneBookIds", "deletedAt", variables, "mongoId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Carts" (id, "mongoId", "userId", "integrationId", "catalogueId", items, "appliedDeals", "totalQuantity", "isActive", "createdAt", "updatedAt") FROM stdin;
0b49cd3d-7a15-49d6-a5c4-383d74efef73	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-11 10:34:56+05:30	2026-05-11 10:34:56.012+05:30
12d6fedd-e5b5-4aa7-9836-8b572071ff9a	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_2056c34994815b36", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-11 11:07:17.188+05:30	2026-05-11 11:07:17.2+05:30
28a20cd2-6763-4e0e-917c-a2fcb5e1ce0f	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-11 12:31:08.438+05:30	2026-05-11 12:31:08.45+05:30
142724e8-a252-49d6-82e8-ed08ef25b2be	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 2, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-11 13:34:14.877+05:30	2026-05-11 13:34:14.89+05:30
6e673c22-8502-4e84-ae29-9e26bb08c732	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-13 17:48:52.378+05:30	2026-05-13 17:48:52.407+05:30
e9fc2e70-50be-4f09-82b9-b713a865baa8	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-14 18:02:31.222+05:30	2026-05-14 18:02:31.23+05:30
89672f69-97f4-4c7d-9802-bf7f8a8bda03	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-18 17:59:47.577+05:30	2026-05-18 17:59:47.59+05:30
6beb238a-6eb8-4c51-9fc7-2763f60dcad6	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-19 17:49:41.162+05:30	2026-05-19 17:49:41.183+05:30
79aabc89-56b6-44eb-836e-fc9aba2e62ec	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_c8769bce45cfe3d3", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-22 22:54:15.123+05:30	2026-05-22 22:54:15.144+05:30
fbf8a7f5-f34a-44d1-a965-ae8ccb130af2	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_2056c34994815b36", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-22 23:13:27.17+05:30	2026-05-22 23:13:27.185+05:30
f0034628-09d6-45db-937f-956bf32a0b59	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_2056c34994815b36", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-22 23:21:16.595+05:30	2026-05-22 23:21:16.615+05:30
768744ff-8ce1-43d8-ab3b-dbc3e3684478	\N	0893032b-3193-47b5-a046-c0f762670f46	bc349e5f-11a0-4020-9150-841d9ce04680	249b4a73-3581-4db5-8c9e-d259c38acdc8	[{"quantity": 1, "productId": "42fcd02e-c546-40a3-b4d0-c37212001b1d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-24 21:00:51.009+05:30	2026-05-24 21:00:51.025+05:30
2332b799-81ec-43e6-82e7-80283944d60a	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 09:28:05.549+05:30	2026-05-27 09:28:05.561+05:30
57894d5b-b568-401c-a160-f375ae316bf3	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 09:31:44.479+05:30	2026-05-27 09:31:44.489+05:30
5ab3f685-41ab-4e97-92cb-7fd6ef98c7a4	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:08:05.496+05:30	2026-05-27 10:08:05.513+05:30
0503eef4-fbd7-49b8-9f55-99ed289e4c39	\N	964c8fa7-d191-4ebc-adc8-9790b2b0197f	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_8c0e42a6419dcdf6", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:11:02.39+05:30	2026-05-27 10:11:02.399+05:30
65a5d739-5980-4097-b004-ba552e61e15e	\N	964c8fa7-d191-4ebc-adc8-9790b2b0197f	908fa830-7d67-4555-8d3b-a72b20636d44	cat_8bd8822dbd89da8f	[{"quantity": 1, "productId": "prod_8c0e42a6419dcdf6", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:11:02.433+05:30	2026-05-27 10:11:02.437+05:30
ba775900-95bc-4bb6-9c67-f346c33f09fa	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:11:04.232+05:30	2026-05-27 10:11:04.237+05:30
5e5bd580-bc89-40ba-81a5-2d65e963f554	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:11:24.687+05:30	2026-05-27 10:11:24.698+05:30
9dbcac46-5a97-459e-8038-9f91333178a4	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:12:49.695+05:30	2026-05-27 10:12:49.709+05:30
48f5be43-6c47-4cc3-920a-8d1455359e3b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "a74f3bcd-8eed-4271-94e7-ed0ff7807f36", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:13:09.057+05:30	2026-05-27 10:13:09.063+05:30
6bc23fb3-a559-489a-832d-b5e7390142f6	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:17:02.805+05:30	2026-05-27 10:17:02.816+05:30
deb98c8d-dc29-49d3-948e-bf9b4de7889d	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:48:12.507+05:30	2026-05-27 10:48:12.58+05:30
1c488580-d72b-4a45-b845-0d0e280a2284	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 10:50:52.132+05:30	2026-05-27 10:50:52.158+05:30
d5ab917a-2e27-4f9e-9694-6d307989fdc9	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "a74f3bcd-8eed-4271-94e7-ed0ff7807f36", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 12:32:44.757+05:30	2026-05-27 12:32:44.808+05:30
2beea8c6-94d2-4c25-ae75-3f6fa57968a6	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 13:33:58.293+05:30	2026-05-27 13:33:58.301+05:30
a6e64cde-3ac3-4359-a793-f46eec5226d4	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-27 17:24:49.423+05:30	2026-05-27 17:24:49.484+05:30
1da16f37-c847-4486-8e8c-a3eb728ca5e1	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-29 20:48:51.807+05:30	2026-05-29 20:48:51.82+05:30
e2073313-b792-44b2-b4a9-5e1689f70aa2	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-30 09:31:46.555+05:30	2026-05-30 09:31:46.614+05:30
1a6bc7af-0c3a-48c6-966d-57e13b4adc2d	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-05-30 09:55:21.095+05:30	2026-05-30 09:55:21.114+05:30
5ca00746-f667-4dad-bcca-0b7af2be6e2b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 3, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}, {"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 12:51:12.209+05:30	2026-06-01 12:51:12.217+05:30
44cfd30f-2d9b-45e9-8a48-fa518c404a27	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 14:12:19.9+05:30	2026-06-01 14:12:19.916+05:30
b4feb77b-bd50-44c7-9041-8d1e80111ebf	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 14:25:06.334+05:30	2026-06-01 14:25:06.348+05:30
77a25285-40ba-4af1-9ee6-29e4e0a19d1d	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	[{"quantity": 1, "productId": "30fd9c4e-4e01-4536-9e44-a79761fc7387", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 15:11:38.781+05:30	2026-06-01 15:11:38.789+05:30
cb68f578-8254-42f2-a00c-eb80a1136508	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 15:11:57.965+05:30	2026-06-01 15:11:57.971+05:30
38dbb5f6-5cdc-46cd-8cf9-2df7d6a18a94	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 16:57:28.587+05:30	2026-06-01 16:57:28.595+05:30
06aa2ee2-1bed-4fda-9198-285b138dae66	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 5, "productId": "c74aed60-fe9b-4db2-94cb-63f86f6fed98", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 16:58:04.331+05:30	2026-06-01 16:58:04.337+05:30
e0431e6c-04f2-4e5f-ad85-bdb006744eff	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 17:28:43.145+05:30	2026-06-01 17:28:43.153+05:30
32fb24fc-7a85-4329-a5e8-f7ecce89cb14	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 20:28:16.334+05:30	2026-06-01 20:28:16.345+05:30
b0e05491-c9be-49d6-a1e1-17a240bf01ae	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 20:40:02.419+05:30	2026-06-01 20:40:02.426+05:30
8355e714-9510-4885-9a9a-ff9fc740377b	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-01 20:49:08.598+05:30	2026-06-01 20:49:08.638+05:30
e8e08fe4-18af-4228-91bf-77c9453cd7d8	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-02 10:59:50.235+05:30	2026-06-02 10:59:50.27+05:30
98479d58-2d8a-4653-89a3-c0103551df8e	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	f	2026-06-02 16:44:51.117+05:30	2026-06-02 16:44:51.149+05:30
aedc724b-a9f6-4608-b945-74c25a10427f	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-02 17:03:44.761+05:30	2026-06-02 17:03:44.761+05:30
46903967-4f4d-451b-96c9-8a286c0081c6	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-02 17:06:34.374+05:30	2026-06-02 17:06:34.374+05:30
cbeea06d-bbc2-4a8e-a8be-6a42c0641851	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-02 17:08:37.353+05:30	2026-06-02 17:08:37.353+05:30
5416585a-3483-4e49-b83e-4e602613ad42	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	75f52ffe-d4e4-4887-9708-c4494df43d21	[{"quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 11:28:32.02+05:30	2026-06-03 11:28:32.02+05:30
526990fb-2c12-47fd-84f0-7d8d5d253052	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	75f52ffe-d4e4-4887-9708-c4494df43d21	[{"quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 11:30:44.725+05:30	2026-06-03 11:30:44.725+05:30
416b2dbe-9493-4c55-8428-39c43e3e0b64	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	75f52ffe-d4e4-4887-9708-c4494df43d21	[{"quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 11:31:29.199+05:30	2026-06-03 11:31:29.199+05:30
6752357d-9461-4a35-8732-82b1e861224f	\N	0893032b-3193-47b5-a046-c0f762670f46	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	[{"quantity": 1, "productId": "30fd9c4e-4e01-4536-9e44-a79761fc7387", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 11:55:51.018+05:30	2026-06-03 11:55:51.018+05:30
38d3848c-ed3b-4272-9724-f42d0769564f	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 11:58:25.127+05:30	2026-06-03 11:58:25.127+05:30
39b31098-df04-4ea3-bf01-93efa5c01ade	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:02:03.719+05:30	2026-06-03 12:02:03.719+05:30
6d1cf02c-9061-4831-94ec-d7944f4bc5bd	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:05:12.139+05:30	2026-06-03 12:05:12.139+05:30
c7af8c1d-3c84-4b06-ada6-4a157e2aa19b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:07:45.521+05:30	2026-06-03 12:07:45.521+05:30
1ff268eb-122f-4999-9b49-2e4b2962098b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:10:29.681+05:30	2026-06-03 12:10:29.681+05:30
34bf44f3-2ea6-40ae-91e2-a940e384b224	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:36:55.404+05:30	2026-06-03 12:36:55.404+05:30
62e65bc1-7b40-495c-8d1a-037f750a0020	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9e788bd7-04ac-4154-af16-cb086c59b39b	[{"quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "customizationId": null, "selectedOptions": []}]	[]	0	t	2026-06-03 12:39:16.777+05:30	2026-06-03 12:39:16.777+05:30
\.


--
-- Data for Name: Catalogues; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Catalogues" (id, "integrationId", name, description, "displayType", "isActive", "createdAt", "updatedAt", "isDeleted", "mongoId") FROM stdin;
01c56244-fde9-4372-b2fc-da4288f161b7	0bfbb67d-2547-4106-a876-ad0db8a8af88	Main Catalogue	Primary grocery and fresh items catalogue for Fresh & Green Organics	\N	t	2026-05-18 09:53:26.401+05:30	2026-05-18 09:53:26.401+05:30	f	\N
42c023ee-8378-48be-a641-5b13a6fba3cd	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	Main Catalogue	Primary grocery and fresh items catalogue for The Gourmet Pantry	\N	t	2026-05-18 09:53:26.421+05:30	2026-05-18 09:53:26.421+05:30	f	\N
303063e3-82e1-4cc4-b58c-b7801b54c2e3	1495f4e0-101d-468a-b2a7-a71ff514d7a2	Main Catalogue	Primary grocery and fresh items catalogue for Spice & Harvest Co.	\N	t	2026-05-18 09:53:26.436+05:30	2026-05-18 09:53:26.436+05:30	f	\N
15b0d44c-efc7-4255-a6df-6ee823d86292	b62f1b85-31fe-4065-a964-3ce587191c59	Main Catalogue	Primary grocery and fresh items catalogue for Daily Needs Supermarket	\N	t	2026-05-18 09:53:26.447+05:30	2026-05-18 09:53:26.447+05:30	f	\N
0318b0ab-23bc-4ec5-993f-f50d24766a5e	d2912933-a21d-475e-a004-04acc4f455ca	Main Catalogue	Primary grocery and fresh items catalogue for Nature's Basket Premium	\N	t	2026-05-18 09:53:26.459+05:30	2026-05-18 09:53:26.459+05:30	f	\N
f3170057-94d6-4a8c-9d45-1732e09f1b96	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	Fresh Dairy & Bakery Menu	Organic milk products, farm fresh eggs, and artisan breads.	\N	t	2026-05-18 12:20:51.174+05:30	2026-05-18 12:20:51.174+05:30	f	\N
75f52ffe-d4e4-4887-9708-c4494df43d21	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	Main Catalogue	Primary offering catalogue for Vijayanagar Organic Farm Fresh	\N	t	2026-05-24 14:11:55.58+05:30	2026-05-24 14:11:55.58+05:30	f	\N
f08f0ec7-8278-457c-b3a8-0d5a983280e1	3a1c4e22-c740-4ea2-8ace-4308de78605d	Main Catalogue	Primary offering catalogue for Heritage Daily & Grocery	\N	t	2026-05-24 14:11:55.584+05:30	2026-05-24 14:11:55.584+05:30	f	\N
cat_8bd8822dbd89da8f	908fa830-7d67-4555-8d3b-a72b20636d44	Main Food Menu	Standard test menu containing appetizers, mains, and desserts.	LIST	t	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	f	\N
cat_99cca0524609a55e	908fa830-7d67-4555-8d3b-a72b20636d44	Cold Drinks & Mocktails	Refreshing beverages, mocktails, and fruit juices.	LIST	t	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	f	\N
f796d111-0ef3-4fb2-9f70-f5ab55407d03	f1665785-dab5-4a4b-a543-109b62e9af4a	Main Food Menu	Standard test menu containing appetizers, mains, and desserts.	LIST	t	2026-05-19 22:22:35.233+05:30	2026-05-19 22:22:35.233+05:30	f	\N
05ed8c8c-728f-4d41-8f33-17db52c559af	f1665785-dab5-4a4b-a543-109b62e9af4a	Cold Drinks & Mocktails	Refreshing beverages, mocktails, and fruit juices.	LIST	t	2026-05-19 22:22:35.25+05:30	2026-05-19 22:22:35.25+05:30	f	\N
88069782-38a4-497d-9cd9-86b4114f43cb	37f3f942-8dec-4e17-8e90-c62f9cf2717d	Main Catalogue	Primary offering catalogue for Nagpur Coffee House (Tilak Nagar)	\N	t	2026-05-24 13:24:51.281+05:30	2026-05-24 13:24:51.281+05:30	f	\N
d546fa92-ccde-4634-bae2-ed2faa473ac7	f0fb8be9-0626-436f-accb-c9eda11d0b08	Main Catalogue	Primary offering catalogue for Gokulpeth Daily Grocery Mart	\N	t	2026-05-24 13:24:51.297+05:30	2026-05-24 13:24:51.297+05:30	f	\N
51247ef2-040e-4f46-b3de-25ffd3916dcd	8d6292bf-1238-4326-920b-35ba543a7ac8	Main Catalogue	Primary offering catalogue for Dharampeth Sweet Palace	\N	t	2026-05-24 13:24:51.307+05:30	2026-05-24 13:24:51.307+05:30	f	\N
9e788bd7-04ac-4154-af16-cb086c59b39b	1f6b2343-2619-429e-b843-dfda8ed66949	Main Catalogue	Primary offering catalogue for Mysore Royal Kitchen (Vijayanagar)	\N	t	2026-05-24 13:45:30.843+05:30	2026-05-24 13:45:30.843+05:30	f	\N
e7d160e1-fd10-440b-a753-76aa564fee69	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	Main Catalogue	Primary offering catalogue for Vijayanagar Organic Groceries	\N	t	2026-05-24 13:45:30.854+05:30	2026-05-24 13:45:30.854+05:30	f	\N
5c28aeb5-8ee6-40ed-8a2c-ceb3c675f79d	65bb875d-0496-4db0-b1fc-ea2fae0630c9	Main Catalogue	Primary offering catalogue for Chamundi Pure Veg Restaurant	\N	t	2026-05-24 13:45:30.861+05:30	2026-05-24 13:45:30.861+05:30	f	\N
8be65832-44f1-4419-8a80-f9fb86fd2df7	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	Main Catalogue	Primary offering catalogue for Royal Heritage Supermarket	\N	t	2026-05-24 13:45:30.866+05:30	2026-05-24 13:45:30.866+05:30	f	\N
c39285bd-6d90-4568-9a40-e37bcfe7c3c2	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	Main Catalogue	Primary offering catalogue for Mysore Filter Coffee House	\N	t	2026-05-24 14:11:55.533+05:30	2026-05-24 14:11:55.533+05:30	f	\N
c46d30f0-f03a-4d6d-947c-addafba1fc1a	19106bf7-bf42-41c0-910f-5ca7ab302313	Main Catalogue	Primary offering catalogue for Cafe Heritage & Bakery	\N	t	2026-05-24 14:11:55.547+05:30	2026-05-24 14:11:55.547+05:30	f	\N
55833a76-e476-42f9-9c73-68a3d265d6e9	4056c17e-7978-40f9-a7cf-5254569ccbfb	Main Catalogue	Primary offering catalogue for Chamundi Chat Center	\N	t	2026-05-24 14:11:55.553+05:30	2026-05-24 14:11:55.553+05:30	f	\N
77924119-caf8-4443-a56e-6369f8509962	494f78a4-8b1c-451f-af8f-c41995696ae1	Main Catalogue	Primary offering catalogue for Idli Mane Vijayanagar	\N	t	2026-05-24 14:11:55.559+05:30	2026-05-24 14:11:55.559+05:30	f	\N
fba835a6-ec67-4a36-bc85-806375752934	957480f9-becd-4755-82d1-182ebd9c01e7	Main Catalogue	Primary offering catalogue for Biryani Durbar Mysuru	\N	t	2026-05-24 14:11:55.565+05:30	2026-05-24 14:11:55.565+05:30	f	\N
48e58d00-6b11-4f7d-914f-b1227d73e2d1	5435a027-bf16-425c-af23-3f7c858cc9e0	Main Catalogue	Primary offering catalogue for Sri Manjunatha Provision Store	\N	t	2026-05-24 14:11:55.574+05:30	2026-05-24 14:11:55.574+05:30	f	\N
74942c9c-bbf0-4abc-8945-3ef103631a7f	c36bc6e3-08de-42d1-b37d-ac439ec1d6c4	Main Catalogue	Primary offering catalogue for Cauvery Supermart	\N	t	2026-05-24 14:11:55.589+05:30	2026-05-24 14:11:55.589+05:30	f	\N
249b4a73-3581-4db5-8c9e-d259c38acdc8	bc349e5f-11a0-4020-9150-841d9ce04680	Main Catalogue	Primary offering catalogue for Mysuru Organic & Groceries	\N	t	2026-05-24 14:11:55.595+05:30	2026-05-24 14:11:55.595+05:30	f	\N
03aede88-26df-4e0b-9766-0863c0277002	5435a027-bf16-425c-af23-3f7c858cc9e0	Sides	side items	Grid View	f	2026-06-03 12:48:50.009+05:30	2026-06-03 12:49:58.965+05:30	f	\N
\.


--
-- Data for Name: ChatMessages; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."ChatMessages" (id, "mongoId", "chatRoomId", sender, content, metadata, "isRead", "createdAt", "updatedAt") FROM stdin;
cc7ec4f8-bfc4-44a8-af76-48bb5b1a6645	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	What is great about your store	{"type": "TEXT", "uuid": "49cb13ac-cf6e-4db4-9db5-d7363f543ffa", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 21:26:48.159+05:30	2026-05-24 21:26:48.159+05:30
caa84725-2aa3-4677-af28-e8e3fde6cff9	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	hello	{"type": "TEXT", "uuid": "c782e663-5fb1-48b9-b10a-5d120214c9f1", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 21:27:01.055+05:30	2026-05-24 21:27:01.055+05:30
ae4bfc9d-4207-4c49-ac16-a2779423c1e7	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	What is great about your store	{"type": "TEXT", "uuid": "d1c81bdc-e64d-4f73-a049-3027b24c8920", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 21:27:40.919+05:30	2026-05-24 21:27:40.919+05:30
f4c16cd6-155c-4b23-9a6c-463c4cd98d22	\N	a56a78dd-b42b-4dcd-8e3f-e2f966739995	user	Hello, what are your hours?	{"type": "TEXT", "uuid": "3700eeff-b034-450a-96de-a6191090a787", "integrationId": "09dacbba-d0e7-4862-8a77-e8bded1ea387", "messageByUser": "d0b83594-f364-48c9-aed6-c1cb29c4223b"}	f	2026-05-24 21:28:44.141+05:30	2026-05-24 21:28:44.141+05:30
22aa970b-7aea-4d14-81e8-777751ecaf37	\N	a56a78dd-b42b-4dcd-8e3f-e2f966739995	assistant	I'm sorry, I don't see any products in our catalogue right now. How else can I help you?	{"type": "TEXT", "uuid": "92699457-6960-410a-8e12-e38b985322e1", "integrationId": "09dacbba-d0e7-4862-8a77-e8bded1ea387"}	f	2026-05-24 21:28:44.19+05:30	2026-05-24 21:28:44.19+05:30
649f7872-28c3-474a-b194-894085d4e03e	\N	a56a78dd-b42b-4dcd-8e3f-e2f966739995	user	Hello, what are your hours without integrationId?	{"type": "TEXT", "uuid": "c1f0d3e0-e4a6-4f21-8e6d-d0b938518cdb", "integrationId": "09dacbba-d0e7-4862-8a77-e8bded1ea387", "messageByUser": "d0b83594-f364-48c9-aed6-c1cb29c4223b"}	f	2026-05-24 21:31:09.691+05:30	2026-05-24 21:31:09.691+05:30
9630fe90-be2a-4586-96fb-bb7c65905851	\N	a56a78dd-b42b-4dcd-8e3f-e2f966739995	assistant	I'm sorry, I don't see any products in our catalogue right now. How else can I help you?	{"type": "TEXT", "uuid": "a9bc13ac-cdcf-4c9a-81d5-de3f677a37f7", "integrationId": "09dacbba-d0e7-4862-8a77-e8bded1ea387"}	f	2026-05-24 21:31:09.8+05:30	2026-05-24 21:31:09.8+05:30
712f5877-bb81-4982-ab2c-00543acc10aa	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	What is great about your store	{"type": "TEXT", "uuid": "4ba99668-69e5-4cdb-b7c5-4c6e624346e5", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 21:35:47.778+05:30	2026-05-24 21:35:47.778+05:30
59f6199b-fa2c-4ca1-8766-92b7dbf3dab6	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	organic rice	{"type": "TEXT", "uuid": "7f08e879-92ce-48d5-a9bb-add93150f937", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 21:35:53.279+05:30	2026-05-24 21:35:53.279+05:30
5422daf4-ff39-4842-864b-3527e2034c03	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	Cost of the rice ?	{"type": "TEXT", "uuid": "29899c6a-451e-489a-96e7-d7fd186da452", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 21:36:11.609+05:30	2026-05-24 21:36:11.609+05:30
aaa4551f-7ead-4607-8869-4560959b75be	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	The Aged Sona Masuri Rice (5kg) costs ₹340.	{"type": "TEXT", "uuid": "f71dfa64-40ee-4dba-9f11-9af702f48236", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 21:36:15.648+05:30	2026-05-24 21:36:15.648+05:30
5414b854-8d77-4604-b255-02f0514bac27	\N	a56a78dd-b42b-4dcd-8e3f-e2f966739995	assistant	Hello from vendor - testing manual override	{"type": "TEXT", "uuid": "813a0c8c-fd4c-4cd6-9d78-d57ecd691d29", "payload": {}, "integrationId": "09dacbba-d0e7-4862-8a77-e8bded1ea387"}	f	2026-05-24 22:01:23.334+05:30	2026-05-24 22:01:23.334+05:30
e121da22-1633-4479-a900-ae4ac6153f93	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	hello	{"type": "TEXT", "uuid": "c1d00595-f042-482a-af77-d3441bb71fcf", "payload": {}, "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:11:08.95+05:30	2026-05-24 22:11:08.95+05:30
a51db2c6-3dc8-42d3-b7fa-8da47706c4fd	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	we can discount the price upto 320 rs	{"type": "TEXT", "uuid": "caf519b5-20de-4e28-a0c1-978454dda9d4", "payload": {}, "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:11:33.758+05:30	2026-05-24 22:11:33.758+05:30
edbf74fd-7f9d-4835-8401-2f441c54a1a6	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	Can you tell me the cost of the rice ?	{"type": "TEXT", "uuid": "993e0d8a-2090-47b9-805a-f324e8751e37", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 22:11:56.168+05:30	2026-05-24 22:11:56.168+05:30
5778d979-2fc2-40cd-9e13-9c362715472e	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	What is great about your store	{"type": "TEXT", "uuid": "b249dda3-1c19-4797-b091-7e4889b17334", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 22:12:10.224+05:30	2026-05-24 22:12:10.224+05:30
5d882f8b-a3dc-43cb-bc4d-babcf844cf9a	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	I can only answer questions about the items in our catalogue. Please let me know if you have a question about a specific product.	{"type": "TEXT", "uuid": "9b4abf3d-5aae-4262-8f3e-565932de9576", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:12:15.299+05:30	2026-05-24 22:12:15.299+05:30
cc020b4a-239c-4cf0-ac17-55af0d8bc6b9	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	Do you have rice ?	{"type": "TEXT", "uuid": "a8dfcbd1-781c-41d3-989c-5569aadc188c", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 22:12:36.884+05:30	2026-05-24 22:12:36.884+05:30
2e450e51-0c77-44a3-9254-bc747edc4ab7	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	Yes, we have rice. We offer Aged Sona Masuri Rice (5kg) for ₹340. It is a premium aged local rice that cooks fluffy and lightweight.	{"type": "TEXT", "uuid": "29013f7d-290b-4626-a3da-88cd8786ef2f", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:12:42.427+05:30	2026-05-24 22:12:42.427+05:30
a8bd330e-d2fa-44b9-87c5-54392c088ac0	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	Can you please add it to my cart	{"type": "TEXT", "uuid": "ec5f8dcc-cf7d-4ad5-adc7-ac1805043fb0", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 22:13:03.247+05:30	2026-05-24 22:13:03.247+05:30
62560694-6aeb-4a50-9a14-3093860c9d19	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	I'd be happy to help! Could you please tell me which item from our catalogue you'd like to add to your cart?\n\nYou can choose from our list of products like the Organic Red Tomatoes, Nanjangud Bananas, or Premium Cashew Nuts.	{"type": "TEXT", "uuid": "d8cff925-df45-4c14-b497-40149c43a642", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:13:09.564+05:30	2026-05-24 22:13:09.564+05:30
da5088dc-07e5-461d-be91-97698ff48f01	\N	ffd25b51-750c-469b-8fec-70b5f5803411	user	Add 5kg masuri to my cart	{"type": "TEXT", "uuid": "05e9fdb0-a046-4fb4-9157-b3389b81e145", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-24 22:15:42.888+05:30	2026-05-24 22:15:42.888+05:30
9d965f99-64f8-4a22-839c-d2a5f073462f	\N	ffd25b51-750c-469b-8fec-70b5f5803411	assistant	Added 5kg Aged Sona Masuri Rice (₹340) to your cart.	{"type": "TEXT", "uuid": "32391814-2c7f-441c-9eb4-afd932bfa35f", "integrationId": "bc349e5f-11a0-4020-9150-841d9ce04680"}	f	2026-05-24 22:15:45.994+05:30	2026-05-24 22:15:45.994+05:30
ddcfe9db-17c3-4eed-a8ef-88f4d96b1f3a	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Hello	{"type": "TEXT", "uuid": "145e378c-2960-4608-a19c-32340a51b49b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-25 17:34:32.562+05:30	2026-05-25 17:34:32.562+05:30
37065fca-37e6-47dc-8c56-c3cf2e952c24	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hello - how can i help you	{"type": "TEXT", "uuid": "6debe353-a0b5-414a-8535-592e5df7aa3f", "payload": {}, "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-25 17:35:48.908+05:30	2026-05-25 17:35:48.908+05:30
4851fd99-df8f-4cc3-bba9-05b582d6f3d9	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	we have discount of 50%	{"type": "TEXT", "uuid": "d84bee13-7529-4d81-b87b-9b02f045d1af", "payload": {}, "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-25 17:36:14.171+05:30	2026-05-25 17:36:14.171+05:30
5ece7ce4-d368-4283-9855-d08bc2a54505	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Hello is AI online	{"type": "TEXT", "uuid": "c40f8630-355f-4fed-9e85-702464a59675", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-25 17:36:40.833+05:30	2026-05-25 17:36:40.833+05:30
794d1a8b-9e7d-443f-9130-40a31baf39a4	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	What is best in your store	{"type": "TEXT", "uuid": "283e0376-732f-4e5f-a486-ed566f719509", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-25 17:39:47.736+05:30	2026-05-25 17:39:47.736+05:30
534e6fc0-59c1-41b9-80fd-93502e183a8e	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	hello	{"type": "TEXT", "uuid": "f2438bc1-4346-4130-9ba8-7c05089f6454", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-26 12:45:29.104+05:30	2026-05-26 12:45:29.104+05:30
051a8c80-7ef5-4d81-a608-edd2dc82e111	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	hello	{"type": "TEXT", "uuid": "71519355-d4ca-414a-bb45-f04f4d8ec2c6", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-26 13:05:12.986+05:30	2026-05-26 13:05:12.986+05:30
2dc08d0c-6ccb-4920-8dc6-8b7dbc880ba5	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "187e58d1-c8db-4022-bc2d-2d6220a3bd00", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-26 13:05:43.083+05:30	2026-05-26 13:05:43.083+05:30
b81380f3-8d32-4561-ad39-3b6dd805effb	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Are you online ?	{"type": "TEXT", "uuid": "4a6cad61-424c-4214-bbd6-68af82fb3173", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-26 13:05:58.727+05:30	2026-05-26 13:05:58.727+05:30
1fddf0a8-29b5-4fdc-afff-a543fae6b381	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "f59a35da-7360-4db8-81c3-eec1318e85e4", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-26 13:06:28.787+05:30	2026-05-26 13:06:28.787+05:30
e1298f4d-7391-42a3-9c65-a9a73df29e4d	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> ₹30.<br>	{"type": "ORDER_DELIVERED", "orderId": "17f8c5f1-58ea-48f2-9cd6-8cb68cc39d93", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:08:41.783+05:30	2026-05-27 10:08:41.783+05:30
049011d1-3b0c-4d8e-80c3-00c1ea33161a	\N	5b084c4d-c386-41ee-84f0-42f6eab675f8	user	Do you have coffee	{"type": "TEXT", "uuid": "34b9e7a7-8638-4df5-ac49-4aa8f4671598", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-27 09:33:37.778+05:30	2026-05-27 09:33:37.778+05:30
1a282116-a3c9-455f-be0b-866b84f20e35	\N	5b084c4d-c386-41ee-84f0-42f6eab675f8	assistant	Yes, we have **Premium Degree Filter Coffee** for ₹40. It’s freshly brewed and served hot! Would you like to order that, or are you interested in our **Steaming Rava Idli (2 Pcs)** for ₹60? 😊	{"type": "TEXT", "uuid": "d3f8a2a6-42be-41a5-a2b7-72199da50718", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4"}	f	2026-05-27 09:33:39.836+05:30	2026-05-27 09:33:39.836+05:30
5a5390f7-07c3-4cfe-b819-5053cc55cd93	\N	5b084c4d-c386-41ee-84f0-42f6eab675f8	user	Best in your hotel	{"type": "TEXT", "uuid": "559fd1ed-0f72-4bde-937d-8a27593b0834", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-27 09:59:59.513+05:30	2026-05-27 09:59:59.513+05:30
75c47288-0604-4cf0-ba77-0723d5c0e730	\N	5b084c4d-c386-41ee-84f0-42f6eab675f8	assistant	Thank you for your kind words! At Mysore Filter Coffee House, our **Premium Degree Filter Coffee (₹40)** is our signature product and customer favorite – perfectly brewed for an authentic, rich flavor. It’s ideal for those who love a strong, aromatic coffee experience.  \n\nIf you'd like a delicious breakfast pairing, our **Steaming Rava Idli (2 Pcs, ₹60)** is freshly prepared and pairs wonderfully with the coffee.  \n\nLet me know if you'd like recommendations or more details! ☕😊	{"type": "TEXT", "uuid": "7e700def-bc76-4d3e-9d62-421e58b58c55", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4"}	f	2026-05-27 10:00:02.838+05:30	2026-05-27 10:00:02.838+05:30
dfe735e1-ac4f-4c52-9390-d15f0df9784a	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	What is best in your shop ?	{"type": "TEXT", "uuid": "a6fed05a-60f8-4bb1-9343-7e1544aeceeb", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-27 10:04:04.465+05:30	2026-05-27 10:04:04.465+05:30
22617244-2ce6-4057-bd02-a248ec46be02	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	At Mysore Royal Kitchen (Vijayanagar), our most celebrated items are:  \n\n1. **Authentic Mysore Masala Dosa (₹90)** - A crispy, flavorful dosa stuffed with a spicy potato masala, served with coconut chutney and sambar. It’s a signature dish loved for its authentic taste and quality.  \n\n2. **Mysore Special Filter Coffee (₹30)** - A strong, aromatic brew made with freshly ground coffee beans, served in a traditional stainless steel	{"type": "TEXT", "uuid": "546f9282-268e-4567-98ae-51ad9ecf231a", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:04:08.286+05:30	2026-05-27 10:04:08.286+05:30
bbdd7681-0937-461d-9deb-fe0fa6e1c0fb	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> ₹90.<br>	{"type": "ORDER_DELIVERED", "orderId": "38d0cce2-6032-48a3-9c51-21093e81b9d1", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:13:26.281+05:30	2026-05-27 10:13:26.281+05:30
ae061edf-2703-4e14-86ff-33cf50ff50d4	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> ₹30.<br>	{"type": "ORDER_DELIVERED", "orderId": "78e7fc96-11cb-4f2a-aa31-788fca3f2944", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 09:28:14.465+05:30	2026-05-27 09:28:21.666+05:30
6589b3a6-e42d-4a03-964f-eafae93d7b31	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> ₹30.<br>	{"type": "ORDER_DELIVERED", "orderId": "5e1862c1-c7f3-4a62-a0cc-ca84b6003478", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:11:10.318+05:30	2026-05-27 10:11:10.318+05:30
4a5e7f5a-4c2a-438c-b629-ea5c4433a649	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Dosa (x1) - ₹75<br><b>Total Paid:</b> ₹75.<br>	{"type": "ORDER_DELIVERED", "orderId": "7531bf39-4245-4e0c-92ef-82d4e3fb14d8", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:13:21.698+05:30	2026-05-27 10:13:21.698+05:30
e1648bed-9fb9-4b55-a8e3-e9e8a9ac6b13	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> ₹30.<br>	{"type": "ORDER_DELIVERED", "orderId": "f5eddce1-2ad1-43ab-8149-809613a3278b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:30:02.199+05:30	2026-05-27 10:30:02.199+05:30
b1dba7b4-aa4b-4e0c-af02-6862cbb9f3fd	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> ₹30.<br>	{"type": "ORDER_DELIVERED", "orderId": "40a48b88-91cd-43b4-9e4e-2ccd8bb3095a", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:48:30.104+05:30	2026-05-27 10:48:30.104+05:30
7957ce1a-bd9c-4b67-918f-2d34ea509133	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Dosa (x1) - ₹75<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "bd0d1b68-f4dc-469e-a416-50911c368be6", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 12:33:02.435+05:30	2026-05-27 12:33:05.289+05:30
f23e6f6a-05c4-4eb6-a5bb-97b82efd277a	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> ₹90.<br>	{"type": "ORDER_DELIVERED", "orderId": "bc909a1c-1d00-458c-a5eb-e70b18e12931", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:13:24.272+05:30	2026-05-27 10:13:24.272+05:30
a719d5a1-8c5e-4a8a-9423-6fa289550a0d	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> ₹90.<br>	{"type": "ORDER_DELIVERED", "orderId": "bc0b2129-ba97-4d3a-942c-a5cec9682bcc", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 09:32:01.856+05:30	2026-05-27 09:32:01.856+05:30
8787807d-44df-4d8f-8767-a3c7af98a71e	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> ₹90.<br>	{"type": "ORDER_DELIVERED", "orderId": "93896c9e-6579-4b6a-be45-e5b72dfe8615", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 10:50:57.01+05:30	2026-05-27 10:50:57.01+05:30
24313302-6228-4704-978f-c01e2ab531ca	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	user	hello	{"type": "TEXT", "uuid": "2737ce1c-71a8-419a-a177-ae3304bcdd2b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "4202016f-47fd-47e7-ace4-81c2be3d4ee6"}	f	2026-05-27 17:11:55.066+05:30	2026-05-27 17:11:55.066+05:30
9c4020ec-0510-4758-b486-c4257c7613bd	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hello! Welcome to Mysore Royal Kitchen. How can I help you today?	{"type": "TEXT", "uuid": "c3b3ae23-5aba-4648-a2e8-6fbbeae98af0", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 17:12:01.214+05:30	2026-05-27 17:12:01.214+05:30
feef64a6-8ae9-46a9-86f7-a8a6070c9bff	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "ece64cef-d7a7-4acc-b5e9-c7516a1b13ff", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-30 09:55:34.353+05:30	2026-05-30 09:55:48.801+05:30
df4528bb-da70-4cb4-a2f2-f17a871cd82d	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "ba42d130-b7aa-4ac3-83ec-264cc5058276", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-27 17:25:01.69+05:30	2026-05-27 17:25:20.159+05:30
ce0b9e09-bb1c-4f92-8a82-dac9cf79aeb4	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "2241be25-a61f-4bbe-9ec2-cf25e5d0a2b3", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-29 20:49:04.801+05:30	2026-05-29 20:49:14.075+05:30
960cbf59-c267-4b92-b77b-fe6cd7bd324f	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "fc4b49c8-80d3-4982-84bb-a18c19e380bc", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 14:25:11.191+05:30	2026-06-01 14:25:11.191+05:30
cbdfd759-97bd-438e-94b1-35e72c2d18b6	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x3) - ₹270<br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "b56b0128-441d-4ae3-8910-6fd6ced800fe", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 12:51:22.584+05:30	2026-06-01 12:51:27.541+05:30
0444a286-6944-4b66-b2ea-a2282ddff161	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "5b47bfb0-18f3-48ca-a746-7b9fb4af411b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-05-30 09:31:58.39+05:30	2026-05-30 09:32:26.485+05:30
a7956389-80c6-4e7c-be9e-0d681acafa5f	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Hello i need coffee	{"type": "TEXT", "uuid": "3ad305f8-87f5-4c03-924c-5eb62cf81e83", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 12:52:07.433+05:30	2026-06-01 12:52:07.433+05:30
b4f67b17-a169-425d-bc8c-bdb222fc5d7f	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	We have "Mysore Special Filter Coffee" for ₹30. Would you like to order it?	{"type": "TEXT", "uuid": "65ff1340-9c9f-4f74-9bec-225ea2df5527", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 12:52:08.562+05:30	2026-06-01 12:52:08.562+05:30
bda4b605-16c6-4c40-8563-73fb74d60cdc	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	what else you want	{"type": "TEXT", "uuid": "ead5d102-a856-49e7-bbd6-0737ebf999f3", "payload": {}, "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 12:52:25.374+05:30	2026-06-01 12:52:25.374+05:30
a361f945-3d36-4525-9c6a-a1bdd2ac996a	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Any food item	{"type": "TEXT", "uuid": "3f3b1433-11e6-48d6-8f52-235fdf8bb781", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 12:52:37.971+05:30	2026-06-01 12:52:37.971+05:30
8181ab03-d44f-4317-8194-7ccab1592672	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Yes, we have several food items:\n*   Dosa\n*   Authentic Mysore Masala Dosa\n*   Kesari Bath	{"type": "TEXT", "uuid": "59959753-0533-4f6a-982a-261f215b5eeb", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 12:52:39.394+05:30	2026-06-01 12:52:39.394+05:30
dbdb4664-5dc0-4737-92ec-5cd338c0147e	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "2b9fbf2b-d57e-482d-9bd0-b48a6d0d3562", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 14:12:24.992+05:30	2026-06-01 14:12:24.992+05:30
5a4e97e2-3bd2-4355-851d-9a3686454bd5	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hi <b>Customer</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "21e276e6-c7b3-4047-b260-e667ca0e963e", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 15:12:04.955+05:30	2026-06-01 15:12:04.955+05:30
3322b9df-6688-4ba4-a756-9b7529e026c9	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "c9c0d0b4-b8ae-4b4d-b704-0d2e78a253f2", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 16:57:33.661+05:30	2026-06-01 16:57:33.661+05:30
1a859c85-1ec3-4921-9778-970d75f712c9	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Kesari Bath (x5) - ₹250<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "0c8a2a20-291b-43f1-b7f6-4794cd5790c4", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 16:58:11.226+05:30	2026-06-01 16:58:16.769+05:30
34bf6adc-a5c2-4061-9231-29ee978179ba	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hi <b>Rajesh</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "a5b71bd6-761c-420b-8d58-fa088bcc542f", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 17:28:48.218+05:30	2026-06-01 17:28:51.911+05:30
5c3d2f1f-2d5e-4c8d-8da0-2f1641aa66f0	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	I want to try coffee	{"type": "TEXT", "uuid": "ae5d2ba9-38f9-43cb-b013-126191fdbfcd", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 17:31:18.331+05:30	2026-06-01 17:31:18.331+05:30
2e4319a9-9daf-41ef-a91e-36e0edf56407	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "0f607b8f-014f-4bd4-8ba6-15fbe5e1c22e", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 17:31:19.101+05:30	2026-06-01 17:31:19.101+05:30
fee0c6cc-df51-4cc6-9387-6d11d23ed9a3	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Recommend the best products here	{"type": "TEXT", "uuid": "5539ed91-97e9-45f2-990c-861377a06af3", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 19:58:15.916+05:30	2026-06-01 19:58:15.916+05:30
2d095aa7-1941-4a3c-875a-6c0d006c7fc9	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "b2f6ffd4-0524-45a4-bde6-06d53ae2636f", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 19:58:16.891+05:30	2026-06-01 19:58:16.891+05:30
a9ef846d-7eef-4b4d-9092-b0fbde723340	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Recommend the best products here	{"type": "TEXT", "uuid": "3bbc76c9-798b-41bf-a438-724939f40701", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 20:01:05.151+05:30	2026-06-01 20:01:05.151+05:30
5e53c8b9-ea2a-4109-9dac-769576f49ae5	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "fa3469ce-f8ce-4943-8e2e-83be9e5b176b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 20:01:05.865+05:30	2026-06-01 20:01:05.865+05:30
1ab1bbac-566e-4970-ac15-f9b993fbfca6	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	Recommend the best products here	{"type": "TEXT", "uuid": "beea12f4-59f1-4f7c-aca1-ec39ef6c409b", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-01 20:04:44.807+05:30	2026-06-01 20:04:44.807+05:30
069fb70d-e7d6-4407-b7f9-6acd0c3d1bf3	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "f45b8e27-6f2e-4336-b936-4d2cad325a1a", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 20:04:45.506+05:30	2026-06-01 20:04:45.506+05:30
8821d87f-e140-4d3c-a596-334202059c56	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hi <b>Rajesh</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "bb455048-19b6-4cda-8077-b0a6b9421f54", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 20:49:17.317+05:30	2026-06-01 20:49:19.428+05:30
e49ba615-75b4-47eb-9d3e-869d4fb72578	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hi <b>Rajesh</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "6e39d440-64a5-4c4f-9595-7962b1ddd1aa", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 20:28:25.286+05:30	2026-06-01 20:29:46.978+05:30
29d08186-1c79-41c9-aeca-78fabd9a3320	\N	70a5a2c9-1ecc-4226-81d3-4a08c28432bf	assistant	Hi <b>Rajesh</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Premium Degree Filter Coffee (x1) - ₹40<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "3213107d-5665-40e1-95da-26a57d8dc73e", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4"}	f	2026-06-01 20:35:01.953+05:30	2026-06-01 20:35:01.953+05:30
dc94d17d-d927-4fff-8056-382e11d90d7e	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	user	I need coffee	{"type": "TEXT", "uuid": "39cfe6cb-8c08-4568-b48b-11abb05a0df1", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "4202016f-47fd-47e7-ace4-81c2be3d4ee6"}	f	2026-06-01 23:41:02.041+05:30	2026-06-01 23:41:02.041+05:30
73f740cc-046b-47ff-92a9-39fc9cb0a66a	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	We have Mysore Special Filter Coffee for ₹30.	{"type": "TEXT", "uuid": "f72e57a0-bd59-4076-9365-f6dbbb533fa8", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 23:41:03.496+05:30	2026-06-01 23:41:03.496+05:30
bfce903e-bf2f-4a6a-ab39-72d6be767bc1	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	Hi <b>Rajesh</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "b26097af-49ac-4611-ad84-8447914650a1", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 20:40:10.812+05:30	2026-06-01 20:40:52.376+05:30
1b6345e9-5a18-44ce-97d2-4ee7398cd979	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	user	Any recommendation from my friend ?	{"type": "TEXT", "uuid": "1cf7ff80-4c88-45d9-b853-2a1ae983b3dd", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "4202016f-47fd-47e7-ace4-81c2be3d4ee6"}	f	2026-06-01 23:41:19.856+05:30	2026-06-01 23:41:19.856+05:30
d2695e59-e4ef-4be7-809d-5744d36e3a2c	\N	de022cb9-fa8c-4ae9-8317-887d0a37e9bf	assistant	For a special treat, I recommend our **Authentic Mysore Masala Dosa** or our **Mysore Special Filter Coffee**!	{"type": "TEXT", "uuid": "a7e041fb-95ed-41a8-a379-44333fd346bf", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-01 23:41:23.57+05:30	2026-06-01 23:41:23.57+05:30
56b7b4ad-c1e6-4add-9c01-a3179be38a52	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "9505b6b0-665f-4b8b-b6b5-263a29a42a02", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-02 10:59:55+05:30	2026-06-02 11:00:09.27+05:30
31da4ce0-2eda-4d0d-a9d2-94965677f0bb	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "30226531-eee4-445a-a28d-8d5df7657648", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-02 17:01:01.586+05:30	2026-06-02 17:01:01.586+05:30
f5f743a4-5fed-4f6b-a5e7-a9b08f882002	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	user	The coffee is super here - please try it	{"type": "TEXT", "uuid": "bbe0ba25-4af7-4069-8c8f-b62a2f9fc58c", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-06-02 11:00:34.515+05:30	2026-06-02 11:00:34.515+05:30
242b5b6a-cb28-4800-a91a-38e4e88e9443	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	That's wonderful to hear! I'm glad you enjoy our Mysore Special Filter Coffee.\n\nIf you have any questions about our products, please feel free to ask!	{"type": "TEXT", "uuid": "557c6de9-aba7-475b-96be-0ab40b6b74a9", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-02 11:00:37.044+05:30	2026-06-02 11:00:37.044+05:30
8e61bac6-3e01-400e-b8db-94947d91102f	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "92a58d4c-9b7e-4c42-a82b-04d963b95537", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:07:07.763+05:30	2026-06-03 12:07:07.763+05:30
3a54103a-f4f7-4b05-810d-ca5bdda59da8	\N	5b084c4d-c386-41ee-84f0-42f6eab675f8	assistant	Hi <b>Praveen R</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Premium Degree Filter Coffee (x1) - ₹40<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "dc29ad83-e63c-4161-8d19-b9b92994286b", "integrationId": "02fbbc13-b593-4e16-ac3c-2ae4dc2844f4"}	f	2026-06-03 12:07:13.548+05:30	2026-06-03 12:07:13.548+05:30
4a202c29-42e4-4cf0-bd1f-371c1b1e7fe1	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "b7af27ef-835f-4474-8cb3-c0429e49f316", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:07:23.496+05:30	2026-06-03 12:07:23.496+05:30
3391a24e-2675-45a5-85b7-f3e56014f70b	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😔<br><br>Your order has been canceled.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Amount:</b> <br><hr>	{"type": "ORDER_CANCELED", "orderId": "b888a6a4-d802-449f-87a6-3ff0cb33fb70", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:07:25.434+05:30	2026-06-03 12:07:25.434+05:30
7e7241a6-ef17-4ef0-b863-6796ec74e56d	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "353dfafd-8463-4c4c-9272-1ac397bbed95", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:38:21.654+05:30	2026-06-03 12:38:24.733+05:30
467bf40d-178b-43c9-a278-5f4de0796c00	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "a0dccc6f-1d1d-4761-9624-45cd0964ba4d", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:10:57.043+05:30	2026-06-03 12:38:27.494+05:30
e19febbd-0380-4f46-a89d-11e8e8b3d231	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "9a632145-2c9a-44ac-a732-c95e9375214e", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:08:17.653+05:30	2026-06-03 12:38:32.848+05:30
3350ae75-75d1-4747-a37d-484c9b8bd520	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Authentic Mysore Masala Dosa (x1) - ₹90<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "a22760e7-5cb3-495d-99f5-8636b61ac2e8", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:05:53.674+05:30	2026-06-03 12:38:37.513+05:30
56612078-e23f-4f37-8c3c-a3caa1555510	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "f449f7d9-0a53-4133-872c-e965a43ea019", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:06:59.797+05:30	2026-06-03 12:38:41.318+05:30
d14410f7-687f-476f-a0ae-c5675d5abf5a	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "dd8f7d04-017d-4f8d-8295-bbda4e05d747", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:07:01.908+05:30	2026-06-03 12:38:46.032+05:30
4411115d-7e4a-46c1-bea1-d6be68b85641	\N	e74f59bc-cba7-4598-b903-7046ccfea9d1	assistant	Hi <b>Praveen R</b>! 😄<br><br>Your order has been delivered successfully.<br><br><b>Items Summary:</b><br>• Mysore Special Filter Coffee (x1) - ₹30<br><b>Total Paid:</b> <br>	{"type": "ORDER_DELIVERED", "orderId": "b33b4510-b7bb-4116-b841-6f0140fc0be2", "integrationId": "1f6b2343-2619-429e-b843-dfda8ed66949"}	f	2026-06-03 12:39:45.216+05:30	2026-06-03 12:39:45.216+05:30
\.


--
-- Data for Name: ChatRooms; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."ChatRooms" (id, "mongoId", "userId", "integrationId", "lastMessage", "isActive", "createdAt", "updatedAt", "isAiActive") FROM stdin;
5b084c4d-c386-41ee-84f0-42f6eab675f8	\N	0893032b-3193-47b5-a046-c0f762670f46	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	\N	t	2026-05-27 09:33:32.12+05:30	2026-05-27 09:33:32.12+05:30	t
de022cb9-fa8c-4ae9-8317-887d0a37e9bf	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	\N	t	2026-05-27 17:11:51.932+05:30	2026-05-27 17:11:51.932+05:30	t
e74f59bc-cba7-4598-b903-7046ccfea9d1	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	\N	t	2026-05-25 17:34:27.372+05:30	2026-06-01 12:52:33.24+05:30	t
70a5a2c9-1ecc-4226-81d3-4a08c28432bf	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	\N	t	2026-06-01 15:11:25.49+05:30	2026-06-01 15:11:25.49+05:30	t
4a2ee57e-5da0-4e22-8340-270c112a47bc	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	\N	t	2026-06-03 13:28:32.88+05:30	2026-06-03 13:28:32.88+05:30	t
e3cd81d9-4199-4217-8d8d-2f6f48025dc9	\N	bb5be236-04ec-4473-8024-e6d47c476467	0bfbb67d-2547-4106-a876-ad0db8a8af88	\N	t	2026-05-24 21:11:16.724+05:30	2026-05-24 21:11:16.724+05:30	t
bf4aa5a2-91a2-492c-90f9-ba0fe6638adc	\N	d0b83594-f364-48c9-aed6-c1cb29c4223b	09dacbba-d0e7-4862-8a77-e8bded1ea387	\N	t	2026-05-24 21:33:28.717+05:30	2026-05-24 21:33:28.717+05:30	t
a56a78dd-b42b-4dcd-8e3f-e2f966739995	\N	0065781d-e778-4f08-b489-c767f5986002	09dacbba-d0e7-4862-8a77-e8bded1ea387	\N	t	2026-05-22 21:25:04.235+05:30	2026-05-24 22:01:23.328+05:30	f
ffd25b51-750c-469b-8fec-70b5f5803411	\N	0893032b-3193-47b5-a046-c0f762670f46	bc349e5f-11a0-4020-9150-841d9ce04680	\N	t	2026-05-24 21:26:38.324+05:30	2026-05-24 22:12:02.325+05:30	t
\.


--
-- Data for Name: Cities; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Cities" (id, name, "stateId", "isActive", "createdAt", "updatedAt") FROM stdin;
eb927813-debb-43fa-8dc1-fb339882b72d	Mysuru	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-05-30 11:37:02.24+05:30	2026-05-30 11:37:02.24+05:30
c58d308a-d23a-447f-9f14-ccd07c6be0a8	Bengaluru	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-05-30 11:37:02.242+05:30	2026-05-30 11:37:02.242+05:30
5d33ae17-a86c-4342-a086-eabfdc658fc5	Bagalkot	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.913+05:30	2026-06-03 12:50:05.913+05:30
c3dee175-4aba-4928-b00d-e065c0722663	Ballari	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.949+05:30	2026-06-03 12:50:05.949+05:30
ffff887e-954d-4b02-9acd-6aca4bba1db7	Belagavi	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.951+05:30	2026-06-03 12:50:05.951+05:30
f02084a4-4be0-4042-a6a5-3ebada5247a0	Bengaluru Rural	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.953+05:30	2026-06-03 12:50:05.953+05:30
0434bf6d-aff5-42d7-a9b5-e32a7a704e7f	Bengaluru Urban	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.955+05:30	2026-06-03 12:50:05.955+05:30
00055b52-028f-4889-ac19-950bf07e3a6b	Bidar	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.956+05:30	2026-06-03 12:50:05.956+05:30
f0074b8b-20cb-491a-b2df-bd41d1ec065c	Chamarajanagar	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.958+05:30	2026-06-03 12:50:05.958+05:30
5fd61faf-b234-4798-9f07-ad42b5ac043c	Chikkaballapur	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.959+05:30	2026-06-03 12:50:05.959+05:30
03db5712-7239-415d-a1da-b93c0599cbab	Chikkamagaluru	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.96+05:30	2026-06-03 12:50:05.96+05:30
5cd8e17d-1567-4002-b7d3-3abb6a0df0bb	Chitradurga	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.962+05:30	2026-06-03 12:50:05.962+05:30
574b376e-55b3-4169-a124-009e9be423bb	Dakshina Kannada	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.963+05:30	2026-06-03 12:50:05.963+05:30
056c7b96-e124-4191-bf30-5b7cb256ccbc	Davanagere	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.964+05:30	2026-06-03 12:50:05.964+05:30
ace77907-2d9e-4e43-8415-812356b8ac95	Dharwad	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.965+05:30	2026-06-03 12:50:05.965+05:30
8ffaf444-697b-47a8-9e03-bf381410ffed	Gadag	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.966+05:30	2026-06-03 12:50:05.966+05:30
92a9caa6-9aca-4dad-948f-947b94b96bf2	Hassan	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.967+05:30	2026-06-03 12:50:05.967+05:30
40ec3711-405b-4f46-8d2a-524439cea87a	Haveri	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.968+05:30	2026-06-03 12:50:05.968+05:30
e71721c3-fc31-454c-896e-e252bdc58e92	Kalaburagi	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.969+05:30	2026-06-03 12:50:05.969+05:30
9b862da0-40fd-4c93-a413-25567b416e1f	Kodagu	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.97+05:30	2026-06-03 12:50:05.97+05:30
e078bd4b-efee-4f85-893e-7b03017b3058	Kolar	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.971+05:30	2026-06-03 12:50:05.971+05:30
c5609d52-926f-4e40-bb39-3e7b8068453f	Koppal	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.972+05:30	2026-06-03 12:50:05.972+05:30
450179ab-25d2-4f1b-a375-afed679f70ee	Mandya	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.973+05:30	2026-06-03 12:50:05.973+05:30
cba06f67-2344-4e91-a1b5-aaab0881fada	Raichur	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.974+05:30	2026-06-03 12:50:05.974+05:30
9c3adb1d-afd6-4462-8448-7b541992e714	Ramanagara	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.975+05:30	2026-06-03 12:50:05.975+05:30
88b3f510-f0a5-44ab-a885-d6e8efbe5c36	Shivamogga	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.976+05:30	2026-06-03 12:50:05.976+05:30
d1d69aa6-0ca3-4ec8-8876-3b214f9dcd7e	Tumakuru	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.977+05:30	2026-06-03 12:50:05.977+05:30
35561195-f0b8-428c-a5a4-c4802dca510a	Udupi	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.978+05:30	2026-06-03 12:50:05.978+05:30
15e06541-f0ed-4bf0-a2f5-5f45717ad12b	Uttara Kannada	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.979+05:30	2026-06-03 12:50:05.979+05:30
741dd673-8e93-4227-acf0-9393125dedc9	Vijayanagara	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.982+05:30	2026-06-03 12:50:05.982+05:30
0553184b-d7ea-444b-af08-adf2833491b9	Vijayapura	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.983+05:30	2026-06-03 12:50:05.983+05:30
3451c0b1-1111-48a7-bc7c-10aec4731abc	Yadgir	fb954aae-56d1-4459-8779-401dc00873ec	t	2026-06-03 12:50:05.984+05:30	2026-06-03 12:50:05.984+05:30
3b9ff6a4-9e57-4d33-83b8-f42dc3edd0f9	Visakhapatnam	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.903+05:30	2026-06-03 12:51:24.903+05:30
03f99f5e-c242-4904-a414-7afa2e7edb48	Vijayawada	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.915+05:30	2026-06-03 12:51:24.915+05:30
ec23fa61-efdd-4441-878b-15a391796f09	Guntur	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.917+05:30	2026-06-03 12:51:24.917+05:30
f09cac05-ae07-4e0a-8870-c3be55f1faf9	Nellore	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.919+05:30	2026-06-03 12:51:24.919+05:30
5aeb12ca-7ac3-412e-ab00-8545e2b7bac6	Kurnool	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.921+05:30	2026-06-03 12:51:24.921+05:30
f12bd9f8-90dd-469d-9a41-3ce55591150b	Kakinada	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.922+05:30	2026-06-03 12:51:24.922+05:30
b9a802a8-a91c-4d2d-962f-59c944adfa36	Rajamahendravaram	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.923+05:30	2026-06-03 12:51:24.923+05:30
a4f89609-d85e-452a-b614-24efd3b98003	Kadapa	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.925+05:30	2026-06-03 12:51:24.925+05:30
be714e08-bd8f-48ca-a862-32178e63036e	Tirupati	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.926+05:30	2026-06-03 12:51:24.926+05:30
7bc0eaea-4cd4-4d74-a136-a926444321a5	Anantapur	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.928+05:30	2026-06-03 12:51:24.928+05:30
d975c22d-f253-42ff-9a34-65c666e559e3	Eluru	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.929+05:30	2026-06-03 12:51:24.929+05:30
9c8916af-90cf-49fc-a823-52557ae2950f	Vizianagaram	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.93+05:30	2026-06-03 12:51:24.93+05:30
dd926132-4131-46d7-9b3e-e2701261c423	Ongole	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.931+05:30	2026-06-03 12:51:24.931+05:30
8257ae2a-b22b-4414-83af-3ed8572a7c28	Tenali	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.932+05:30	2026-06-03 12:51:24.932+05:30
a28becfa-4c68-43bf-ad08-a0419212a7ca	Proddatur	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.933+05:30	2026-06-03 12:51:24.933+05:30
235ac507-ca57-48e8-b186-a4ebc13b4b31	Chittoor	d8859326-b80b-40c8-a6f4-4810e5a02c24	t	2026-06-03 12:51:24.934+05:30	2026-06-03 12:51:24.934+05:30
cb91a3c9-452f-4b0e-9f67-89a22928caae	Itanagar	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.936+05:30	2026-06-03 12:51:24.936+05:30
383840f5-635a-4a36-adf5-56bdc6c7685f	Naharlagun	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.937+05:30	2026-06-03 12:51:24.937+05:30
6fef15c8-2c80-4510-b3bc-f1b0bedf1dd9	Tawang	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.938+05:30	2026-06-03 12:51:24.938+05:30
2d298629-06c0-42cf-b4f1-ef14efed3283	Pasighat	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.939+05:30	2026-06-03 12:51:24.939+05:30
5516c63b-8f4c-4ef3-85d2-625793183d6d	Ziro	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.94+05:30	2026-06-03 12:51:24.94+05:30
76937eda-0342-4de1-b02c-eff16126b1e1	Bomdila	3dbec08b-f826-4829-9a01-7571e1ba01d1	t	2026-06-03 12:51:24.941+05:30	2026-06-03 12:51:24.941+05:30
7e4cfb5c-e533-40be-bbfa-e2438f1219f5	Guwahati	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.942+05:30	2026-06-03 12:51:24.942+05:30
01d9451f-4691-4eff-98ad-8b41fd67fa2b	Silchar	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.943+05:30	2026-06-03 12:51:24.943+05:30
cecb76e5-972a-4114-8888-7a2d6d9d51a8	Dibrugarh	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.944+05:30	2026-06-03 12:51:24.944+05:30
e40ebd78-9e98-4473-895f-726e7db67903	Jorhat	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.945+05:30	2026-06-03 12:51:24.945+05:30
eea40768-3c34-4d4c-9a85-8d111bc98467	Nagaon	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.946+05:30	2026-06-03 12:51:24.946+05:30
a1cc8ba8-2bd4-4c85-b685-d0e2996939ec	Tinsukia	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.947+05:30	2026-06-03 12:51:24.947+05:30
01388f04-6195-4a5e-b795-470fb976fb35	Tezpur	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.948+05:30	2026-06-03 12:51:24.948+05:30
a74f4f5e-30fb-4a81-939e-d307eaf1703e	Bongaigaon	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.949+05:30	2026-06-03 12:51:24.949+05:30
c6b12a6c-e9a9-4af1-90d2-01a5b9fe50f0	Dhubri	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.95+05:30	2026-06-03 12:51:24.95+05:30
dd6f69c1-3f45-425b-8355-51a83e20d655	Diphu	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.951+05:30	2026-06-03 12:51:24.951+05:30
e5e77de4-a07d-498e-a323-fe7bb88659f2	North Lakhimpur	7b8e1a3f-9e69-48a0-8ede-936577d95205	t	2026-06-03 12:51:24.952+05:30	2026-06-03 12:51:24.952+05:30
66e13b3a-a806-40e4-bd8e-4bbe87bbe179	Patna	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.953+05:30	2026-06-03 12:51:24.953+05:30
89202e4a-effc-45d6-9e8d-d3e186b4b9f6	Gaya	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.955+05:30	2026-06-03 12:51:24.955+05:30
b9ec88e5-21c6-40ab-99a3-9867de1cd477	Bhagalpur	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.955+05:30	2026-06-03 12:51:24.955+05:30
acf08d72-3fb7-40e7-94ec-7075b17f08c9	Muzaffarpur	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.957+05:30	2026-06-03 12:51:24.957+05:30
2329dacc-c641-4e79-94fd-0fba4470239f	Bihar Sharif	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.959+05:30	2026-06-03 12:51:24.959+05:30
bdaa69f8-9191-4996-a2e5-faabe7a07f32	Darbhanga	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.96+05:30	2026-06-03 12:51:24.96+05:30
570c3328-a785-43bc-acf6-f97b978e9762	Arrah	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.961+05:30	2026-06-03 12:51:24.961+05:30
e983e063-bd91-40a0-987d-bd3eb52f8545	Begusarai	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.963+05:30	2026-06-03 12:51:24.963+05:30
c026d21d-64ab-4495-9853-64deb6c6e1f4	Purnia	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.964+05:30	2026-06-03 12:51:24.964+05:30
dae925db-b706-4e00-b0a9-c47a0be98b90	Katihar	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.965+05:30	2026-06-03 12:51:24.965+05:30
da0ec5df-0645-4636-9765-59cd9f791c7f	Munger	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	t	2026-06-03 12:51:24.966+05:30	2026-06-03 12:51:24.966+05:30
1c317e63-d6c9-4515-9a6d-2c2344e9f24d	Raipur	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.967+05:30	2026-06-03 12:51:24.967+05:30
08a1bd6e-07d0-41a9-bb56-2a1a274d2101	Bhilai	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.969+05:30	2026-06-03 12:51:24.969+05:30
425b7a21-a12e-4512-b91a-52972a4a9a1b	Bilaspur	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.97+05:30	2026-06-03 12:51:24.97+05:30
172f0dbf-329b-4bfc-bb72-4e2cc6845f5b	Korba	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.971+05:30	2026-06-03 12:51:24.971+05:30
959ce631-07e6-48dd-a05e-5430f150351a	Rajnandgaon	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.972+05:30	2026-06-03 12:51:24.972+05:30
3b389dd8-ce92-4258-b1aa-ecf64471614e	Jagdalpur	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.973+05:30	2026-06-03 12:51:24.973+05:30
147e59cd-62d1-449a-b1a6-76fa2752ec9e	Ambikapur	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.974+05:30	2026-06-03 12:51:24.974+05:30
3c8b5ab0-d9f4-4551-a8a7-2c89ff36c558	Dhamtari	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.975+05:30	2026-06-03 12:51:24.975+05:30
c7249f32-04a0-4bc4-b562-4da006ed4d7e	Durg	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.976+05:30	2026-06-03 12:51:24.976+05:30
f56eab4c-6f2a-4cab-a9e4-bca6363d3161	Mahasamund	d6b4001c-b832-4907-95a2-c0c50b817961	t	2026-06-03 12:51:24.976+05:30	2026-06-03 12:51:24.976+05:30
fdb3a767-d7cb-43af-85da-7d991e0a8655	Panaji	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.978+05:30	2026-06-03 12:51:24.978+05:30
60211d44-cda6-40a1-be69-2dfcaddcee05	Margao	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.978+05:30	2026-06-03 12:51:24.978+05:30
486069cc-89d5-40b4-8f28-fd8791f9e3ff	Vasco da Gama	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.98+05:30	2026-06-03 12:51:24.98+05:30
1f626ef4-6d6d-491c-a14f-b0b8016b5873	Mapusa	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.981+05:30	2026-06-03 12:51:24.981+05:30
2a31cf47-066e-41f8-8218-b737b39e4bf6	Ponda	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.982+05:30	2026-06-03 12:51:24.982+05:30
eb2de9b1-bea8-4d36-9e61-1f7e0d4e6717	Bicholim	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	t	2026-06-03 12:51:24.982+05:30	2026-06-03 12:51:24.982+05:30
03359a5c-7ec2-415b-b9a0-eac3848a8216	Ahmedabad	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.985+05:30	2026-06-03 12:51:24.985+05:30
dd50d908-a2f4-488a-a766-6c5d40094dd7	Surat	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.986+05:30	2026-06-03 12:51:24.986+05:30
1af56f34-6904-4c01-8908-e6aa16618b1f	Vadodara	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.987+05:30	2026-06-03 12:51:24.987+05:30
f197cf09-520d-4b63-bcfb-305bb6012693	Rajkot	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.988+05:30	2026-06-03 12:51:24.988+05:30
4594f0f1-26df-43de-8e03-ac44f5344bfe	Bhavnagar	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.989+05:30	2026-06-03 12:51:24.989+05:30
cbcccbaa-6eeb-4ad5-8f2e-6869ed545e98	Jamnagar	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.989+05:30	2026-06-03 12:51:24.989+05:30
e4de1f8e-9cb2-47a9-8eaa-baa987a21958	Junagadh	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.99+05:30	2026-06-03 12:51:24.99+05:30
e99b9efc-84c2-42eb-8edc-973d13560e32	Gandhinagar	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.991+05:30	2026-06-03 12:51:24.991+05:30
3794e562-f8dd-451a-a03a-143de1a083fb	Nadiad	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.992+05:30	2026-06-03 12:51:24.992+05:30
c1166f93-a3df-4bc0-9e96-e322dfa28225	Anand	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.995+05:30	2026-06-03 12:51:24.995+05:30
0e6eee6f-fd2e-4d4a-808f-b0354ccfaf5d	Morbi	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.996+05:30	2026-06-03 12:51:24.996+05:30
e8b40b72-ca79-4f57-b04a-8514f55efd97	Mehsana	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.997+05:30	2026-06-03 12:51:24.997+05:30
1b674b90-e60f-4372-88c5-b3c917462e47	Bhuj	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.998+05:30	2026-06-03 12:51:24.998+05:30
a19112a7-1389-4e0d-8b01-b797e81d5ed8	Valsad	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:24.999+05:30	2026-06-03 12:51:24.999+05:30
f7e0a238-89e8-4fa5-b5a4-df2ca44ab82c	Vapi	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:25+05:30	2026-06-03 12:51:25+05:30
ab0e1b86-adab-4715-9da0-aafcc63e18f7	Bharuch	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:25.001+05:30	2026-06-03 12:51:25.001+05:30
c8d4d8aa-7624-4531-8baa-85f1e5858f8d	Porbandar	76c159fe-419f-4ed0-b09e-2ac709c52a08	t	2026-06-03 12:51:25.002+05:30	2026-06-03 12:51:25.002+05:30
a78e9d10-6ddf-428a-bb51-35b2603c2db4	Gurugram	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.003+05:30	2026-06-03 12:51:25.003+05:30
756391b7-08de-4188-abfb-3956c5cd6145	Faridabad	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.004+05:30	2026-06-03 12:51:25.004+05:30
687a7a6c-33c3-42ca-8c4c-1d5b9a97961f	Panipat	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.004+05:30	2026-06-03 12:51:25.004+05:30
ca145b78-a12c-4eb8-9405-646166689c61	Ambala	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.005+05:30	2026-06-03 12:51:25.005+05:30
7a97c8ed-1956-4160-bd42-ff2d808b66aa	Yamunanagar	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.006+05:30	2026-06-03 12:51:25.006+05:30
c8fdfaa6-d2e2-46bb-a700-cc9a7e38eee1	Rohtak	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.008+05:30	2026-06-03 12:51:25.008+05:30
9685e90e-f148-48c9-a616-3a5f074ea9b8	Hisar	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.009+05:30	2026-06-03 12:51:25.009+05:30
1f38ccc8-3f99-4eb9-bbb6-14bc63087f44	Karnal	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.01+05:30	2026-06-03 12:51:25.01+05:30
22150b61-ab73-4309-838d-d989f6e89872	Sonipat	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.011+05:30	2026-06-03 12:51:25.011+05:30
3b3f72df-7d18-42ab-88f1-8de221fb9d99	Panchkula	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.012+05:30	2026-06-03 12:51:25.012+05:30
70456cba-d6a2-45b8-a262-e2beca616e85	Sirsa	3c018355-5b26-4020-8b60-dcb530df3245	t	2026-06-03 12:51:25.013+05:30	2026-06-03 12:51:25.013+05:30
5fc28233-5bfc-4ab5-b4d2-834792337107	Shimla	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.015+05:30	2026-06-03 12:51:25.015+05:30
74f68daf-83ae-4263-a587-966347d8f4b1	Dharamshala	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.016+05:30	2026-06-03 12:51:25.016+05:30
3cba7b57-7894-4de7-9af5-8d215c823d44	Solan	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.017+05:30	2026-06-03 12:51:25.017+05:30
4b2a8f1e-5915-42de-bfa3-c0c679062567	Mandi	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.018+05:30	2026-06-03 12:51:25.018+05:30
335aeb5b-4882-4024-9f06-2aa017835bdc	Nahan	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.018+05:30	2026-06-03 12:51:25.018+05:30
21ce1078-f537-4742-9f77-1febc6340cf6	Una	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.02+05:30	2026-06-03 12:51:25.02+05:30
b3c9bf05-a5f3-4420-93c1-6715d80fdb73	Kullu	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	t	2026-06-03 12:51:25.021+05:30	2026-06-03 12:51:25.021+05:30
790d01e1-7d70-46db-a563-952b12e6de82	Ranchi	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.022+05:30	2026-06-03 12:51:25.022+05:30
9fa3f2b8-b4f3-4b8b-9cb4-295b4cc38593	Jamshedpur	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.023+05:30	2026-06-03 12:51:25.023+05:30
7d437e85-f970-4035-a77d-f80f19e74813	Dhanbad	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.023+05:30	2026-06-03 12:51:25.023+05:30
472f3b69-42ff-4f37-9a67-114747b66083	Bokaro Steel City	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.024+05:30	2026-06-03 12:51:25.024+05:30
23c3f0a2-e3d2-482e-a804-5d14b960b482	Deoghar	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.025+05:30	2026-06-03 12:51:25.025+05:30
a4c2cb51-c8f8-4e70-a721-d6b34955b8b4	Phusro	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.026+05:30	2026-06-03 12:51:25.026+05:30
141eaeab-33b6-4090-8b5d-5fc87d3e4bfb	Hazaribagh	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.027+05:30	2026-06-03 12:51:25.027+05:30
52e2d4b4-2240-4754-a901-d4560af791ea	Giridih	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.029+05:30	2026-06-03 12:51:25.029+05:30
298b58ff-606d-426c-990c-f51c88214dcf	Ramgarh	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.03+05:30	2026-06-03 12:51:25.03+05:30
791924d4-b75e-411d-ad41-e95f0593a648	Medininagar	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	t	2026-06-03 12:51:25.031+05:30	2026-06-03 12:51:25.031+05:30
bfd059c3-fe77-458b-aec6-77631bd3df4a	Thiruvananthapuram	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.032+05:30	2026-06-03 12:51:25.032+05:30
4e3e3212-a829-4d98-b28a-947700c40cf5	Kochi	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.033+05:30	2026-06-03 12:51:25.033+05:30
d2bd2f7c-3c91-4ec9-b70c-4b8f1893c81e	Kozhikode	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.034+05:30	2026-06-03 12:51:25.034+05:30
e7e97f42-9afb-45bd-8e8c-f896f40ae4fc	Kollam	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.035+05:30	2026-06-03 12:51:25.035+05:30
d6d669b0-6f06-4810-a96c-dd42653e9903	Thrissur	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.036+05:30	2026-06-03 12:51:25.036+05:30
a4d6aa1c-fe29-4ced-a4cd-b4d1aaec4794	Alappuzha	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.037+05:30	2026-06-03 12:51:25.037+05:30
8c78bb95-b7e5-40c3-a7e7-763ac2cc023b	Palakkad	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.038+05:30	2026-06-03 12:51:25.038+05:30
4b4ee118-0e51-471e-bfb6-7fcbbe409f1b	Malappuram	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.039+05:30	2026-06-03 12:51:25.039+05:30
347a8b51-29f2-40fe-ab22-07c2793b9c0f	Kannur	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.04+05:30	2026-06-03 12:51:25.04+05:30
ece2aaa7-ed9b-46b6-8841-4d57144b353d	Kottayam	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.041+05:30	2026-06-03 12:51:25.041+05:30
ded471ab-c357-4e24-9c83-7ad6497e46b8	Kasaragod	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.042+05:30	2026-06-03 12:51:25.042+05:30
dd9da3ba-4220-47fa-85bc-85b5e61395d2	Pathanamthitta	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.044+05:30	2026-06-03 12:51:25.044+05:30
8ffdb3c8-429f-4ce9-82fa-52b1523981cf	Idukki	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.044+05:30	2026-06-03 12:51:25.044+05:30
2b619b8e-2061-456b-a913-ed68be56294d	Wayanad	603b384d-e11e-41b0-956a-2ecbc6049839	t	2026-06-03 12:51:25.045+05:30	2026-06-03 12:51:25.045+05:30
431884e0-9e24-4009-a869-610b7508a91f	Indore	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.047+05:30	2026-06-03 12:51:25.047+05:30
d7834aa3-db8f-4775-b670-f04f00ddd6f7	Bhopal	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.047+05:30	2026-06-03 12:51:25.047+05:30
149a0d76-ae61-48bb-9275-b0718a43f9ec	Jabalpur	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.048+05:30	2026-06-03 12:51:25.048+05:30
88ee1abf-4733-4ad7-837b-18d48db778f9	Gwalior	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.049+05:30	2026-06-03 12:51:25.049+05:30
20fca95b-53b6-4efe-a173-7c82cbcd54a0	Ujjain	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.05+05:30	2026-06-03 12:51:25.05+05:30
812253f7-a246-4670-95ed-aa9d15bc7e99	Sagar	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.051+05:30	2026-06-03 12:51:25.051+05:30
2f22cb33-a26d-4259-944b-d44551446d96	Dewas	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.052+05:30	2026-06-03 12:51:25.052+05:30
8813bde0-caba-4538-ac70-88e3c6e530e7	Satna	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.054+05:30	2026-06-03 12:51:25.054+05:30
cd2f24c5-e916-4884-ab75-4f2d52ebb46c	Ratlam	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.055+05:30	2026-06-03 12:51:25.055+05:30
2b94e32b-6e66-4d71-81a3-7210dbd66a00	Rewa	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.056+05:30	2026-06-03 12:51:25.056+05:30
a42f3eaa-fd92-47bf-beab-9463f55c8fcd	Murwara	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.057+05:30	2026-06-03 12:51:25.057+05:30
befaf39d-0bb3-418c-ae70-7a4f25e7fab4	Singrauli	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.059+05:30	2026-06-03 12:51:25.059+05:30
b292bd92-5639-4538-bdc6-8a39f59c39e8	Khandwa	e572b3c3-d877-42c5-b966-27350b44bf98	t	2026-06-03 12:51:25.059+05:30	2026-06-03 12:51:25.059+05:30
8e717c4b-04f8-4e27-a675-1f85162f45f4	Mumbai	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.061+05:30	2026-06-03 12:51:25.061+05:30
e662b6bd-2d82-42f4-a627-c1aa81a50e18	Pune	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.062+05:30	2026-06-03 12:51:25.062+05:30
7b2c451d-6666-4806-821f-679576858cd1	Nagpur	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.063+05:30	2026-06-03 12:51:25.063+05:30
31b576a7-3b4c-4b85-a0ee-8831a03557d1	Thane	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.063+05:30	2026-06-03 12:51:25.063+05:30
41306646-09ec-4df9-90b6-ded36056c252	Nashik	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.064+05:30	2026-06-03 12:51:25.064+05:30
988a60e0-220c-42fb-adc0-3d5cc305e903	Aurangabad	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.065+05:30	2026-06-03 12:51:25.065+05:30
dcd39eb5-c7e1-44cc-9b7c-5f3a7e0ab5f2	Solapur	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.066+05:30	2026-06-03 12:51:25.066+05:30
f786e04e-deba-4034-9f2f-2356a8f74ebe	Amravati	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.067+05:30	2026-06-03 12:51:25.067+05:30
cb48ea4c-b75b-43fb-882c-1df3530490d7	Navi Mumbai	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.068+05:30	2026-06-03 12:51:25.068+05:30
4c418a02-a5a1-45f5-a8e4-6f10a75b34d4	Kolhapur	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.07+05:30	2026-06-03 12:51:25.07+05:30
c5025d77-182a-4327-a586-d275b92bb775	Sangli	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.071+05:30	2026-06-03 12:51:25.071+05:30
39ebe99c-175b-4587-b8ef-6521918a9b06	Jalgaon	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.072+05:30	2026-06-03 12:51:25.072+05:30
79e596d1-6646-4cfa-9dce-96c1faa95f4b	Akola	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.073+05:30	2026-06-03 12:51:25.073+05:30
a550d487-237c-47c9-b5bd-d99962d6be67	Latur	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.074+05:30	2026-06-03 12:51:25.074+05:30
539563f6-e417-4f51-8df5-565efe85533e	Dhule	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.075+05:30	2026-06-03 12:51:25.075+05:30
4484cfb8-b079-4bf3-befc-19f1cf67f461	Ahmednagar	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.076+05:30	2026-06-03 12:51:25.076+05:30
5ba91c1d-8b14-48aa-9a7d-39ac18abcdda	Chandrapur	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.076+05:30	2026-06-03 12:51:25.076+05:30
92e01c49-4103-4543-94a9-5ab90b35405a	Parbhani	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.077+05:30	2026-06-03 12:51:25.077+05:30
188b79fa-7448-46cb-b995-116b8bec184a	Ichalkaranji	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.078+05:30	2026-06-03 12:51:25.078+05:30
fb6dbb98-00ab-4afb-9b17-260596b25d1d	Jalna	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.079+05:30	2026-06-03 12:51:25.079+05:30
84ff351b-a6ea-4d58-bc5f-572b050bc997	Bhusawal	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.08+05:30	2026-06-03 12:51:25.08+05:30
100c23bd-23b0-418f-887b-e5501b52c486	Panvel	f606c192-d17b-4e0f-8a28-fc883704d92a	t	2026-06-03 12:51:25.081+05:30	2026-06-03 12:51:25.081+05:30
7f889679-da69-492c-a2f0-3d7b8ef39909	Imphal	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.081+05:30	2026-06-03 12:51:25.081+05:30
46892bda-bf75-4d0a-82c8-213a816afc42	Thoubal	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.082+05:30	2026-06-03 12:51:25.082+05:30
3e95ea76-a7ca-4fef-880e-cd1e2a198f78	Kakching	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.084+05:30	2026-06-03 12:51:25.084+05:30
4fcf3d54-8e74-4425-9d6e-ad7728f39e8a	Churachandpur	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.085+05:30	2026-06-03 12:51:25.085+05:30
5f7940ca-9edf-4755-a6b8-a35401f26f56	Ukhrul	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.085+05:30	2026-06-03 12:51:25.085+05:30
9ee572a7-3aa3-480d-a6f7-61f7f6805136	Senapati	bce3117e-b617-43d5-b1d9-602c5b7c7776	t	2026-06-03 12:51:25.086+05:30	2026-06-03 12:51:25.086+05:30
9eafa291-9d49-48bc-a13c-a5734915beb7	Shillong	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.087+05:30	2026-06-03 12:51:25.087+05:30
5a46c2b9-259f-4dd8-90ea-1e6788c77d53	Tura	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.088+05:30	2026-06-03 12:51:25.088+05:30
7ae9677d-aadb-4af0-a50f-f57f25bf582e	Jowai	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.088+05:30	2026-06-03 12:51:25.088+05:30
f4f9363a-b2b4-41fe-b558-192265f79a06	Nongpoh	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.089+05:30	2026-06-03 12:51:25.089+05:30
4dab7b5f-310e-4f56-b819-7271600d39f0	Williamnagar	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.09+05:30	2026-06-03 12:51:25.09+05:30
57b74f95-7c08-40ba-a815-d4fec3d44cb8	Baghmara	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	t	2026-06-03 12:51:25.093+05:30	2026-06-03 12:51:25.093+05:30
1eea06ad-d784-47a0-96cf-5e3b10948bb1	Aizawl	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.093+05:30	2026-06-03 12:51:25.093+05:30
1a8d81eb-48cc-46da-9389-9b26afc0c48b	Lunglei	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.094+05:30	2026-06-03 12:51:25.094+05:30
7d794849-f021-4540-b738-72c266c6ad12	Saiha	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.095+05:30	2026-06-03 12:51:25.095+05:30
2ba04641-c149-443c-af64-a2f8fd9bde69	Champhai	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.095+05:30	2026-06-03 12:51:25.095+05:30
3676011f-9068-421b-a978-7c20ee474d71	Kolasib	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.097+05:30	2026-06-03 12:51:25.097+05:30
8b99ce48-1f3f-4a38-8587-536ac86b0ee4	Serchhip	7c253320-db48-4085-853d-b44428ff6e1f	t	2026-06-03 12:51:25.098+05:30	2026-06-03 12:51:25.098+05:30
6d5427a7-512f-4e3c-8e8b-782a77aa1ecc	Kohima	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.099+05:30	2026-06-03 12:51:25.099+05:30
14d5665e-ea1b-4d09-80c0-8cbb629fc30a	Dimapur	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.1+05:30	2026-06-03 12:51:25.1+05:30
43a7e0d0-c7ac-43e3-8c3d-bc50be74eb9a	Mokokchung	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.101+05:30	2026-06-03 12:51:25.101+05:30
7cf6c322-f66d-4233-a6dd-51d525dc44de	Tuensang	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.102+05:30	2026-06-03 12:51:25.102+05:30
261778bf-3fd6-4b26-9466-5633237ee5b0	Wokha	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.103+05:30	2026-06-03 12:51:25.103+05:30
a19fe476-df54-497f-8b82-5028de1e0035	Zunheboto	95517351-d154-4ebd-89d6-636990a2ad78	t	2026-06-03 12:51:25.104+05:30	2026-06-03 12:51:25.104+05:30
e3091810-306b-4d2b-b121-7f531c34318e	Bhubaneswar	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.105+05:30	2026-06-03 12:51:25.105+05:30
eab5b22b-df6c-4093-b1c1-45610dd4d9da	Cuttack	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.106+05:30	2026-06-03 12:51:25.106+05:30
ba296d03-0977-4728-a11f-4102665ba9d5	Rourkela	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.107+05:30	2026-06-03 12:51:25.107+05:30
523e8485-618d-495f-9c43-5cd4a83e7515	Brahmapur	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.108+05:30	2026-06-03 12:51:25.108+05:30
5c64eaa8-8b4f-43d2-9cc0-9821d46c1c2d	Sambalpur	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.109+05:30	2026-06-03 12:51:25.109+05:30
37fa6231-128e-4efa-a665-013073dcfecb	Puri	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.11+05:30	2026-06-03 12:51:25.11+05:30
a73b79ac-6734-41be-88b9-fe7198aa0473	Balasore	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.111+05:30	2026-06-03 12:51:25.111+05:30
b7621cbd-80c8-4ef4-befb-aeeae68de4b6	Bhadrak	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.111+05:30	2026-06-03 12:51:25.111+05:30
aeb68a65-47b3-43ab-b1cd-84f770570810	Baripada	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.112+05:30	2026-06-03 12:51:25.112+05:30
f0b50255-3cc9-4e36-b0ef-02a9972240cf	Jharsuguda	818c7e30-31cc-4a4d-a574-aaca8e436e51	t	2026-06-03 12:51:25.113+05:30	2026-06-03 12:51:25.113+05:30
3cb28522-4047-4da4-8db6-9881857f9f6f	Ludhiana	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.114+05:30	2026-06-03 12:51:25.114+05:30
57e9047c-bcce-464d-bfd2-8e8bd389e42a	Amritsar	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.116+05:30	2026-06-03 12:51:25.116+05:30
a892cfd9-64aa-48d4-904d-e9e8ccd81457	Jalandhar	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.116+05:30	2026-06-03 12:51:25.116+05:30
f9ca34dc-f418-43cd-beeb-f5430d351165	Patiala	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.117+05:30	2026-06-03 12:51:25.117+05:30
50d9f96e-a89a-45bf-b233-7d09ea214b07	Bathinda	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.118+05:30	2026-06-03 12:51:25.118+05:30
787b0436-cb36-4224-a788-344e063e06e5	Mohali	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.119+05:30	2026-06-03 12:51:25.119+05:30
9731d008-7469-431f-843c-93ce6fdaf82e	Hoshiarpur	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.12+05:30	2026-06-03 12:51:25.12+05:30
332c3ea5-7d1d-4217-b49f-3bfb72e7b9bc	Pathankot	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.12+05:30	2026-06-03 12:51:25.12+05:30
e6dbde05-1c9c-4c14-9221-8182a8963e0c	Moga	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.121+05:30	2026-06-03 12:51:25.121+05:30
90346fc4-a2c4-4728-a4de-76e65ba645ff	Abohar	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.122+05:30	2026-06-03 12:51:25.122+05:30
692ae7b3-8076-4c81-8a6d-530e7f286f7a	Khanna	1097dbae-0488-4ef1-8451-790f2edbd807	t	2026-06-03 12:51:25.123+05:30	2026-06-03 12:51:25.123+05:30
910a789d-af7d-4d4d-9ed8-8a3cff76bddd	Jaipur	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.124+05:30	2026-06-03 12:51:25.124+05:30
ac3399cf-486b-4c2b-8c6c-bf419cfb1e07	Jodhpur	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.126+05:30	2026-06-03 12:51:25.126+05:30
a31b6db8-77ed-40be-81fa-b08f1c3d116a	Udaipur	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.127+05:30	2026-06-03 12:51:25.127+05:30
6a6e8166-684f-4408-ac40-0f61330b13f6	Kota	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.128+05:30	2026-06-03 12:51:25.128+05:30
6a3e6c1e-08cc-4c18-a595-8f6dfb3b5f10	Bikaner	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.129+05:30	2026-06-03 12:51:25.129+05:30
395291bd-3325-4901-8152-d3eb91e038e0	Ajmer	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.13+05:30	2026-06-03 12:51:25.13+05:30
c6c072d1-5549-4c94-a567-e785262bbcd6	Bhilwara	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.131+05:30	2026-06-03 12:51:25.131+05:30
8f553cb2-a759-418d-b3b7-6a4b5bc783f4	Alwar	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.132+05:30	2026-06-03 12:51:25.132+05:30
1378bd05-19bc-48f5-87f2-4eea7fb53028	Sikar	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.132+05:30	2026-06-03 12:51:25.132+05:30
a9de5101-bc4e-49e1-88d3-eae79e868a2d	Bharatpur	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.133+05:30	2026-06-03 12:51:25.133+05:30
707ccf9e-e0da-4ba1-89bc-35d59eebd70c	Ganganagar	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.134+05:30	2026-06-03 12:51:25.134+05:30
02075d52-1ac4-4e29-9e67-5385f10876fc	Pali	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	t	2026-06-03 12:51:25.135+05:30	2026-06-03 12:51:25.135+05:30
2c7eea18-8f21-4be7-aaf0-9c21cfc4b308	Gangtok	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.136+05:30	2026-06-03 12:51:25.136+05:30
aafa4995-5af0-41c7-8404-cc200822f93b	Namchi	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.137+05:30	2026-06-03 12:51:25.137+05:30
d113caaf-5265-42ac-9174-35388d5f97dc	Geyzing	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.138+05:30	2026-06-03 12:51:25.138+05:30
66171e54-f044-48c3-8bca-1bb06cbbb551	Mangan	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.139+05:30	2026-06-03 12:51:25.139+05:30
58d1d622-5f87-4ead-ae67-10d6402dbe94	Singtam	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.14+05:30	2026-06-03 12:51:25.14+05:30
a390379a-b5a7-4906-83c7-ef5a3a97d6b6	Rangpo	2afac6cf-dfed-4710-8aee-b426d50a0fa7	t	2026-06-03 12:51:25.141+05:30	2026-06-03 12:51:25.141+05:30
ecc142b4-dddf-4fe6-adab-b65ce70fa88e	Chennai	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.142+05:30	2026-06-03 12:51:25.142+05:30
f67cab22-ecd1-4090-915a-4d339281ee00	Coimbatore	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.143+05:30	2026-06-03 12:51:25.143+05:30
41a63fd6-e140-4380-bcba-6be3c1c1ddc3	Madurai	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.144+05:30	2026-06-03 12:51:25.144+05:30
fe1f6cb6-b99c-4342-9e57-343a84a71b03	Trichy	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.145+05:30	2026-06-03 12:51:25.145+05:30
b19a0e07-8bc5-412b-a720-f0024b5518d1	Salem	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.146+05:30	2026-06-03 12:51:25.146+05:30
266a8965-4103-4595-9180-8c33958820bf	Tiruppur	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.147+05:30	2026-06-03 12:51:25.147+05:30
da043181-9750-4589-8961-d0ef1b667a82	Erode	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.148+05:30	2026-06-03 12:51:25.148+05:30
9933046c-a481-4a22-9eea-9baf257dd099	Vellore	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.149+05:30	2026-06-03 12:51:25.149+05:30
e894a7eb-2679-4f5e-8215-1f8a38ce96e2	Tirunelveli	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.149+05:30	2026-06-03 12:51:25.149+05:30
11b75597-f9eb-405e-8f92-baf7e6e11820	Thoothukudi	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.15+05:30	2026-06-03 12:51:25.15+05:30
fa69e230-042e-44a1-9cf7-c8522e6eabc0	Nagercoil	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.152+05:30	2026-06-03 12:51:25.152+05:30
e953d2ee-7d74-48ca-9438-f055e5d4856d	Thanjavur	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.153+05:30	2026-06-03 12:51:25.153+05:30
198166f3-2b90-4ba9-8c6d-4a7a1e57ff26	Dindigul	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.154+05:30	2026-06-03 12:51:25.154+05:30
704e225a-0ca8-4785-894a-e16af398afb8	Ranipet	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.155+05:30	2026-06-03 12:51:25.155+05:30
6e103956-2c78-418c-a0b0-92e953656ddb	Sivakasi	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.156+05:30	2026-06-03 12:51:25.156+05:30
d83d901c-9eb1-4d99-81f4-d625c5d3b624	Karur	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.156+05:30	2026-06-03 12:51:25.156+05:30
30865264-466a-4e50-bf2e-7808e5c0d0f6	Kancheepuram	6af5c023-48de-4510-83ad-1c3fa6dd1bad	t	2026-06-03 12:51:25.158+05:30	2026-06-03 12:51:25.158+05:30
6679150a-13a7-4afb-a8f9-5d561839991d	Hyderabad	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.158+05:30	2026-06-03 12:51:25.158+05:30
f5b74211-32db-4b63-b32f-e391f2f4168d	Warangal	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.159+05:30	2026-06-03 12:51:25.159+05:30
fd7c7741-802d-49ed-b2a1-9a34a42c0c5e	Nizamabad	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.16+05:30	2026-06-03 12:51:25.16+05:30
36e7bad4-2a8b-41ba-bed0-af2d4a7c7ea1	Karimnagar	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.161+05:30	2026-06-03 12:51:25.161+05:30
730c5e4e-20aa-484f-aeb1-189d21a9c236	Ramagundam	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.162+05:30	2026-06-03 12:51:25.162+05:30
e75d4657-3912-4594-8bfb-fe9b5b07f8d1	Khammam	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.163+05:30	2026-06-03 12:51:25.163+05:30
4a427419-f5bc-4449-bcb0-91ded8bd127c	Mahbubnagar	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.165+05:30	2026-06-03 12:51:25.165+05:30
9ad59d24-fef5-4a50-a6fa-f0e8cc33e6ec	Nalgonda	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.165+05:30	2026-06-03 12:51:25.165+05:30
2bca5582-50b8-4285-9383-77b9da1bf0fd	Adilabad	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.166+05:30	2026-06-03 12:51:25.166+05:30
00df5757-b2f4-4483-8d18-c831208a22c4	Suryapet	e595fce2-ccef-4479-b84e-dfeb1a67b631	t	2026-06-03 12:51:25.167+05:30	2026-06-03 12:51:25.167+05:30
2c040155-754e-4327-88ef-453859abd48c	Agartala	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.168+05:30	2026-06-03 12:51:25.168+05:30
c1ba5cf3-0d61-469f-90db-5bcaa4e6aaea	Dharmanagar	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.169+05:30	2026-06-03 12:51:25.169+05:30
5cf3c7e1-4df4-449f-880c-30b8202bbf88	Udaipur	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.17+05:30	2026-06-03 12:51:25.17+05:30
2fe97096-5211-44ee-a1e4-177cee7506f2	Kailasahar	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.171+05:30	2026-06-03 12:51:25.171+05:30
30db8565-082a-475c-9a3e-83cecc800650	Belonia	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.172+05:30	2026-06-03 12:51:25.172+05:30
34369791-d72e-44d8-9ed8-3eb640bee3f6	Ambassa	c72319eb-fc39-4e24-b753-9420b750bfcb	t	2026-06-03 12:51:25.173+05:30	2026-06-03 12:51:25.173+05:30
f0cb6d37-d050-4ac9-8cfa-57b67341455a	Lucknow	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.174+05:30	2026-06-03 12:51:25.174+05:30
7233bed5-4b52-42df-9480-bb974a8d7812	Kanpur	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.175+05:30	2026-06-03 12:51:25.175+05:30
9d867738-ddd6-4adb-91cb-a99c8d16b6d9	Ghaziabad	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.176+05:30	2026-06-03 12:51:25.176+05:30
cdf03e92-9784-4480-b3a7-c4036f66ef6f	Agra	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.176+05:30	2026-06-03 12:51:25.176+05:30
688dc09f-5231-442e-8517-e3459b4c6332	Meerut	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.177+05:30	2026-06-03 12:51:25.177+05:30
e5d1ac7c-f9c2-4a90-904d-88df1640a57e	Varanasi	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.179+05:30	2026-06-03 12:51:25.179+05:30
274dc38f-79ac-4536-ae6b-1212dcfbd986	Prayagraj	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.182+05:30	2026-06-03 12:51:25.182+05:30
bb8fcbe2-1723-4481-b91a-948dd65acb57	Bareilly	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.183+05:30	2026-06-03 12:51:25.183+05:30
89b2b8fd-f9d6-4553-8e95-c4e8265b87a0	Aligarh	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.203+05:30	2026-06-03 12:51:25.203+05:30
3da2176e-88bd-4e1b-9bef-31cdde2c1509	Moradabad	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.218+05:30	2026-06-03 12:51:25.218+05:30
00bc1667-d10a-4ac8-9c95-59827808c46e	Gorakhpur	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.249+05:30	2026-06-03 12:51:25.249+05:30
cc2e9648-b178-4283-9988-352a6e25af04	Noida	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.257+05:30	2026-06-03 12:51:25.257+05:30
1f4fdf99-35e2-4ce3-a9b1-61fae3eaed7a	Greater Noida	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.258+05:30	2026-06-03 12:51:25.258+05:30
7163ae3f-b783-40d4-bc58-7c4ecbb2c204	Jhansi	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.26+05:30	2026-06-03 12:51:25.26+05:30
74bc9a6b-47cc-4fa1-9a1a-c597018500de	Muzaffarnagar	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.262+05:30	2026-06-03 12:51:25.262+05:30
1f15d434-e438-4695-bc4c-e30e955f3d75	Mathura	6368b6c3-2b77-46ea-9d63-a84236ed4825	t	2026-06-03 12:51:25.265+05:30	2026-06-03 12:51:25.265+05:30
8ecd057c-3bce-4024-bed9-09f08805de93	Dehradun	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.269+05:30	2026-06-03 12:51:25.269+05:30
3a4e46cc-172c-413b-84d1-23cf4bb89fb1	Haridwar	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.278+05:30	2026-06-03 12:51:25.278+05:30
6a29b744-3470-44f4-978b-1d5370108459	Haldwani	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.281+05:30	2026-06-03 12:51:25.281+05:30
b44ed15d-608c-47a1-9c12-0ad9d72da364	Rudrapur	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.283+05:30	2026-06-03 12:51:25.283+05:30
66d1d373-a0c4-4dd3-ba0a-46833313ddde	Kashipur	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.284+05:30	2026-06-03 12:51:25.284+05:30
472cd4e0-6e65-4c46-be59-930754cecfc6	Roorkee	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.285+05:30	2026-06-03 12:51:25.285+05:30
70ada27a-60f9-4f27-95e7-6cb8261de2fb	Rishikesh	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.287+05:30	2026-06-03 12:51:25.287+05:30
0400fdfc-6040-4ce5-80e5-cc6870d3104c	Pithoragarh	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.288+05:30	2026-06-03 12:51:25.288+05:30
173b3103-d1cb-4bf2-9185-acb3ba6a811e	Ramnagar	9679d928-43ef-47b1-b5e1-5c0f080627bb	t	2026-06-03 12:51:25.289+05:30	2026-06-03 12:51:25.289+05:30
24cca722-9dc6-47ee-a666-ca107670cea0	Kolkata	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.291+05:30	2026-06-03 12:51:25.291+05:30
9d0d649c-44c4-4f80-aaf4-73dd574d022d	Howrah	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.292+05:30	2026-06-03 12:51:25.292+05:30
d83db250-e61a-4e69-bc69-4604ccb7e0e7	Darjeeling	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.294+05:30	2026-06-03 12:51:25.294+05:30
b787704d-8c79-4bea-a5d9-a6beeac816b9	Siliguri	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.295+05:30	2026-06-03 12:51:25.295+05:30
680c4367-a9a6-451d-99bf-ba0deff9b243	Asansol	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.296+05:30	2026-06-03 12:51:25.296+05:30
d4d1e647-0e66-42d8-a017-b1c0b3603cec	Durgapur	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.297+05:30	2026-06-03 12:51:25.297+05:30
031e071a-e09b-4977-8d0f-eca82d1dc094	Kharagpur	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.299+05:30	2026-06-03 12:51:25.299+05:30
1cd50833-8096-49a5-a4c6-220893043407	Bardhaman	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.3+05:30	2026-06-03 12:51:25.3+05:30
44c205b0-79f9-4575-93f3-6654e109ae10	Malda	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.301+05:30	2026-06-03 12:51:25.301+05:30
59af94b6-eade-49dc-a5e7-b6a1fb479b3f	Baharampur	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.303+05:30	2026-06-03 12:51:25.303+05:30
6f3b6570-536e-4795-881d-2da6af847279	Haldia	67d8ee2a-792a-43e5-bda4-28ba0c223318	t	2026-06-03 12:51:25.305+05:30	2026-06-03 12:51:25.305+05:30
5982fd81-b77a-4cb5-a495-9191e0ecd0b6	Chandigarh	58b64fbb-97b3-48bc-b414-7c113d373e3d	t	2026-06-03 12:51:25.307+05:30	2026-06-03 12:51:25.307+05:30
f2c33009-dc57-4571-aea7-ca3ca106d40e	New Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.308+05:30	2026-06-03 12:51:25.308+05:30
b0355ea1-9412-43c2-aded-893c8bd13bac	North Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.309+05:30	2026-06-03 12:51:25.309+05:30
996e48c0-fd73-4a4c-b2e0-05f14abfed57	South Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.31+05:30	2026-06-03 12:51:25.31+05:30
4b76b431-35a4-4092-8906-3d81e94475a1	East Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.311+05:30	2026-06-03 12:51:25.311+05:30
c204e26f-5bd4-4db8-a926-21b9e58373c2	West Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.314+05:30	2026-06-03 12:51:25.314+05:30
c79986da-ce94-4add-9a24-89a239e3cb2e	Central Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.315+05:30	2026-06-03 12:51:25.315+05:30
1a3002e9-8b5c-4490-8c73-f10ffaad9a67	North West Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.316+05:30	2026-06-03 12:51:25.316+05:30
d5f0e4f7-369b-40c1-9c36-5fe57043f300	North East Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.316+05:30	2026-06-03 12:51:25.316+05:30
7f9af94b-3441-4323-99da-cdc551f81fb6	South West Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.317+05:30	2026-06-03 12:51:25.317+05:30
55521e65-551c-4f8f-a379-99c4892bd670	South East Delhi	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.318+05:30	2026-06-03 12:51:25.318+05:30
393306d9-0bee-4a50-b4b0-34c477d844a5	Shahdara	4d5d3212-bb46-4912-9b47-c58339e33422	t	2026-06-03 12:51:25.321+05:30	2026-06-03 12:51:25.321+05:30
6087615a-1b89-4f57-aab8-301307015951	Srinagar	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.322+05:30	2026-06-03 12:51:25.322+05:30
10d858df-ed6f-49b7-a983-b3c6973b7fd3	Jammu	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.323+05:30	2026-06-03 12:51:25.323+05:30
5779b92a-db95-4a38-bc20-5338b5b861bf	Anantnag	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.324+05:30	2026-06-03 12:51:25.324+05:30
d61bfaa2-ec2c-4889-9ade-1b10853ea267	Baramulla	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.326+05:30	2026-06-03 12:51:25.326+05:30
c23fab7f-c4c6-48c1-a7ff-56cc93646c81	Kathua	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.327+05:30	2026-06-03 12:51:25.327+05:30
cc00be37-bee1-4b47-b186-0a17f945088c	Sopore	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.328+05:30	2026-06-03 12:51:25.328+05:30
4bcd9090-09ae-4a6a-81a8-e4149bb7f1df	Udhampur	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.331+05:30	2026-06-03 12:51:25.331+05:30
a76416e3-3cdc-4f8a-88af-647bae1aed34	Poonch	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.332+05:30	2026-06-03 12:51:25.332+05:30
09f0e052-5ac2-4f86-94a5-f84aca3bc44f	Rajouri	60046d5a-c870-49ef-b256-2b5f67ff7970	t	2026-06-03 12:51:25.333+05:30	2026-06-03 12:51:25.333+05:30
b633317d-3dcf-4570-8baf-1a2567354db1	Leh	60990765-969d-4a7a-8780-619a3474f17c	t	2026-06-03 12:51:25.334+05:30	2026-06-03 12:51:25.334+05:30
5075d304-6757-4108-82d5-56125760a50c	Kargil	60990765-969d-4a7a-8780-619a3474f17c	t	2026-06-03 12:51:25.335+05:30	2026-06-03 12:51:25.335+05:30
d79ed76d-4569-4fad-b0f2-894abf311fd6	Kavaratti	ae086e68-3d45-473f-a25a-80afd9e1f564	t	2026-06-03 12:51:25.336+05:30	2026-06-03 12:51:25.336+05:30
4a158a0b-c584-4e29-90f5-76a7774f403d	Minicoy	ae086e68-3d45-473f-a25a-80afd9e1f564	t	2026-06-03 12:51:25.338+05:30	2026-06-03 12:51:25.338+05:30
f8fa0814-d4df-47c2-b3ea-0f032361db5f	Amini	ae086e68-3d45-473f-a25a-80afd9e1f564	t	2026-06-03 12:51:25.339+05:30	2026-06-03 12:51:25.339+05:30
6b0a8742-f8bc-4c82-bb32-96a20c295551	Andrott	ae086e68-3d45-473f-a25a-80afd9e1f564	t	2026-06-03 12:51:25.341+05:30	2026-06-03 12:51:25.341+05:30
39f91e8c-15bd-44fc-a6d0-6c9600e3e00f	Puducherry	fb6a643d-95f4-434c-9738-7ccc6963cdca	t	2026-06-03 12:51:25.342+05:30	2026-06-03 12:51:25.342+05:30
313800f9-7ea6-4e13-967f-aaacef795bbb	Karaikal	fb6a643d-95f4-434c-9738-7ccc6963cdca	t	2026-06-03 12:51:25.343+05:30	2026-06-03 12:51:25.343+05:30
0b782641-343e-4f81-b2bb-a1fd94a37ab0	Mahe	fb6a643d-95f4-434c-9738-7ccc6963cdca	t	2026-06-03 12:51:25.344+05:30	2026-06-03 12:51:25.344+05:30
724f9fee-ef07-4afd-8b3b-228d211f689b	Yanam	fb6a643d-95f4-434c-9738-7ccc6963cdca	t	2026-06-03 12:51:25.345+05:30	2026-06-03 12:51:25.345+05:30
b7175106-ce40-4748-8a3c-afc5a8d00309	Port Blair	7a43f743-d98b-4577-ad6c-32d6587cb844	t	2026-06-03 12:51:25.346+05:30	2026-06-03 12:51:25.346+05:30
d085ab01-fb1a-4dfa-8990-03810cde0917	Car Nicobar	7a43f743-d98b-4577-ad6c-32d6587cb844	t	2026-06-03 12:51:25.347+05:30	2026-06-03 12:51:25.347+05:30
0742ec76-61aa-4624-92f3-423fb9225df3	Mayabunder	7a43f743-d98b-4577-ad6c-32d6587cb844	t	2026-06-03 12:51:25.348+05:30	2026-06-03 12:51:25.348+05:30
\.


--
-- Data for Name: Countries; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Countries" (id, name, code, "isActive", "createdAt", "updatedAt") FROM stdin;
f9d4d888-8469-4c65-a253-8f9095bc2514	India	IN	t	2026-05-30 11:37:02.234+05:30	2026-05-30 11:37:02.234+05:30
\.


--
-- Data for Name: Customizations; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Customizations" (id, "mongoId", "integrationId", "customizationName", options, "isActive", "isDeleted", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Deals; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Deals" (id, "mongoId", "integrationId", name, descriptions, "discountType", "couponCode", "couponType", "discountValue", "buyQuantity", "getQuantity", "startDate", "endDate", "minOrderValue", "maxDiscount", "usageLimit", "perUserLimit", "isDealOfTheDay", "isDeleted", "isActive", "usageCount", "catalogueId", "appliesOnProducts", "createdAt", "updatedAt") FROM stdin;
b90cd7ae-c5d3-43c4-aa2c-481f0d4993f1	\N	09dacbba-d0e7-4862-8a77-e8bded1ea387	Test Deal 6	[]	percentage	\N	store_coupon	10	0	0	2026-05-22 21:25:52.904+05:30	2026-05-23 21:25:52.904+05:30	0	0	0	0	f	f	t	0	\N	[]	2026-05-22 21:25:52.904+05:30	2026-05-22 21:25:52.904+05:30
95c2ba92-e16d-4351-8f75-91911e371320	\N	09dacbba-d0e7-4862-8a77-e8bded1ea387	Test Deal 7	[]	percentage	\N	store_coupon	10	0	0	2026-05-22 21:26:10.899+05:30	2026-05-23 21:26:10.899+05:30	0	0	0	0	f	f	t	0	\N	[]	2026-05-22 21:26:10.899+05:30	2026-05-22 21:26:10.899+05:30
\.


--


--
-- Data for Name: IntegrationDocuments; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."IntegrationDocuments" (id, uuid, "integrationId", "documentUrl", "documentName", "documentOriginalName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: IntegrationFBs; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."IntegrationFBs" (id, "integrationId", "prepTimeMinutes", "cuisineType", "createdAt", "updatedAt") FROM stdin;
7985566b-7e6b-442c-b19f-23d33226243d	eda5847c-55a5-456a-a166-996a95a6be3a	0	\N	2026-06-02 20:34:49.708+05:30	2026-06-02 20:34:49.708+05:30
9293eb7e-fe24-4161-a021-941f8f7de030	77b5fc71-e3e9-4a0e-9ff4-58cb81710100	0	\N	2026-06-02 21:51:56.449+05:30	2026-06-02 21:51:56.449+05:30
0d77b43c-565c-4599-aa9d-7e82e31d951c	2274fdcf-4283-4681-a87c-f56834b6f0c0	0	\N	2026-06-03 11:51:20.1+05:30	2026-06-03 11:51:20.1+05:30
\.


--
-- Data for Name: IntegrationGroceries; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."IntegrationGroceries" (id, "integrationId", "organicCert", "deliverySlots", "createdAt", "updatedAt") FROM stdin;
28c0b4dc-facf-48a2-b177-fcc3d390dd93	e05735a9-b1eb-444b-84bc-db352b6688b8	\N	{}	2026-06-02 21:54:12.496+05:30	2026-06-02 21:54:12.496+05:30
\.


--
-- Data for Name: IntegrationRetails; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."IntegrationRetails" (id, "integrationId", "returnPolicyDays", "shippingRates", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Integrations; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Integrations" (id, "mongoId", logo, "integrationName", "apiUrl", "chatBaseUrl", description, "webhookUrl", "apiAuthKey", "welcomeMessagePayLoad", "phoneNumber", email, category, "isActive", "isApproved", "isOnboarded", "addressLine", city, state, country, pincode, landmark, "gstNumber", "panNumber", "aadharNumber", razorpay, "cdpAccessToken", "createdAt", "updatedAt", latitude, longitude, website, "isDocumentsUploaded", "isTubuluAppSetupDone", "shopEstablishmentNumber", "verticalType", capabilities, "phoneNumberOtp", "phoneVerificationExpiry", documents, role, "emailOtp", "emailVerificationExpiry", "parentId", upi, "assignedCity", "commissionRate", "trustScore", "isGstVerified", "isPanVerified", "isAadharVerified", "pstnDID", "sarvamApiKey", "isSuspended", "openingHours", "bannerImage", "deliveryFee", "minimumOrderValue", "estimatedDeliveryTime", "countryId", "stateId", "cityId", "receiptSettings", "geminiApiKey") FROM stdin;
333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Vijayanagar Organic Groceries	\N	\N	Earthy premium fresh fruits, organic local vegetables, unpolished pulses, and cold-pressed oils.	\N	\N	{}	+919900000202	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:45:30.851+05:30	2026-06-01 23:12:29.054+05:30	12.32250000	76.60150000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
276a3e39-06aa-46ab-b73b-774f8192fb11	\N	http://10.0.2.2:3008/images/bakery1.png	test 	\N	\N	\N	\N	a63133c9-9474-4d3d-88d8-1cbf40c6b7f1	{}	9090909090		FB	t	t	t	fadsfd	fsadf	fsadf	India	fsdaf	\N				{}	\N	2026-05-09 20:11:08.706+05:30	2026-06-01 23:12:29.061+05:30	12.91410000	77.64120000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9889653435	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
6c858926-3ba4-4c6c-9cce-e134b4a77a20	\N	http://10.0.2.2:3008/images/bakery1.png	Tubulu Master Admin	\N	\N		\N	4f094085-e829-42da-b1c8-c7f95f6945c7	{}	9999999999	pradeep.r@pinnacle.com	SuperAdmin	f	t	t	bangalore	Bangalore	Karnataka	India	562162	\N	\N	\N	\N	{}	\N	2026-05-09 15:42:29.009+05:30	2026-06-02 11:44:36.344+05:30	12.91410000	77.64120000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-16 10:56:19+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	\N	{"logoUrl": "https://test.com/logo.png", "footerNote": "Test Footer", "headerNote": "Test Header", "primaryColor": "#000000"}	\N
4056c17e-7978-40f9-a7cf-5254569ccbfb	\N	https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	Chamundi Chat Center	\N	\N	Spicy Masala Puri, Sev Puri, Dahi Puri, and mouthwatering local chats.	\N	\N	{}	+919900000303	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.551+05:30	2026-06-01 23:12:29.062+05:30	12.32200000	76.60250000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	\N	https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop	Mysore Filter Coffee House	\N	\N	Hot filter coffee, chicory blends, and traditional south Indian breakfast bites.	\N	\N	{}	+919900000301	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.486+05:30	2026-06-01 23:12:29.063+05:30	12.32390000	76.60350000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
65bb875d-0496-4db0-b1fc-ea2fae0630c9	\N	https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop	Chamundi Pure Veg Restaurant	\N	\N	Delectable South Indian meals, North Indian curries, fresh tandoori roti, and refreshing fruit juices.	\N	\N	{}	+919900000203	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:45:30.858+05:30	2026-06-01 23:12:29.064+05:30	12.32550000	76.60000000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
bc349e5f-11a0-4020-9150-841d9ce04680	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Mysuru Organic & Groceries	\N	\N	Cold pressed oils, millets, brown rice, rock salt, and healthy alternatives.	\N	\N	{}	+919900000405	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.591+05:30	2026-06-01 23:12:29.066+05:30	12.32350000	76.60500000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	643017	2026-05-25 15:09:55+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
1495f4e0-101d-468a-b2a7-a71ff514d7a2	\N	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop	Spice & Harvest Co.	\N	\N	Traditional store for unpolished pulses, handpicked whole spices, fresh flours, and dry fruits.	\N	\N	{}	+919900000003	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.433+05:30	2026-06-01 23:12:29.068+05:30	12.96950000	77.59250000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9663421220	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
b62f1b85-31fe-4065-a964-3ce587191c59	\N	https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop	Daily Needs Supermarket	\N	\N	Your neighborhood hypermarket for daily dairy, bread, eggs, packaged snacks, drinks, and home hygiene products.	\N	\N	{}	+919900000004	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.444+05:30	2026-06-01 23:12:29.064+05:30	12.97850000	77.59150000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9175346557	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
832d3a09-2688-4891-a6fc-526fe96f298c	\N	http://10.0.2.2:3008/images/bakery1.png	Pradeep Updated Name	\N	\N	Test About Description	\N	0bd06e5a-1450-42b3-b0f2-c2baa5704c6c	{}	+919844982389	\N	SuperAdmin	t	t	t	123 Main St	Bengaluru	Karnataka	India	560001	\N	\N	\N	\N	{}	\N	2026-05-10 16:27:34.981+05:30	2026-06-02 11:44:36.357+05:30	12.91410000	77.64120000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	510383	2026-05-24 12:26:41+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9114912051	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
8d6292bf-1238-4326-920b-35ba543a7ac8	\N	https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600&auto=format&fit=crop	Dharampeth Sweet Palace	\N	\N	 Nagpur Special Orange Burfi, fresh Kaju Katli, Bengali sweets, and evening hot chaat snacks.	\N	\N	{}	+919900000103	\N	FB	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:24:51.303+05:30	2026-06-02 11:44:36.358+05:30	21.15000000	79.08700000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
908fa830-7d67-4555-8d3b-a72b20636d44	\N	http://10.0.2.2:3008/images/bakery1.png	Anand Bakery	\N	\N	\N	\N	f2291716-f863-49bb-8600-ef34c1f85499	{}	1234512345	adfdf@f.com	FB	t	t	t	fdsafdsaf	Bengaluru	Karnataka	India	565656	fasdfdsf				{"oauthState": "acebaf54f3b7a3218027eeb8d1534a3b", "oauthStateExpiresAt": "2026-05-22T18:11:42.447Z"}	\N	2026-05-09 20:18:46.998+05:30	2026-06-01 23:12:29.071+05:30	12.97880000	77.64080000	fadsfds	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-15 18:21:56+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
d2912933-a21d-475e-a004-04acc4f455ca	\N	https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	Nature's Basket Premium	\N	\N	Exotic wellness destination for vegan milk, organic chia seeds, gluten-free superfoods, and cold-pressed juices.	\N	\N	{}	+919900000005	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.458+05:30	2026-06-01 23:12:29.069+05:30	12.96550000	77.60150000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9606739892	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
3a1c4e22-c740-4ea2-8ace-4308de78605d	\N	https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600&auto=format&fit=crop	Heritage Daily & Grocery	\N	\N	Fresh paneer, buttermilk, cheese, premium eggs, and morning essentials.	\N	\N	{}	+919900000403	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.582+05:30	2026-06-01 23:12:29.074+05:30	12.32180000	76.60300000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
957480f9-becd-4755-82d1-182ebd9c01e7	\N	https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop	Biryani Durbar Mysuru	\N	\N	Fragrant Donne Biryani, Kebabs, and traditional spices.	\N	\N	{}	+919900000305	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.563+05:30	2026-06-01 23:12:29.075+05:30	12.32280000	76.60050000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
0bfbb67d-2547-4106-a876-ad0db8a8af88	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Fresh & Green Organics	\N	\N	Earthy, farm-to-table organic produce, premium fresh fruits, herbs, and hydroponic greens.	\N	\N	{}	+919900000001	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.353+05:30	2026-06-01 23:12:29.075+05:30	12.97250000	77.59550000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9168379033	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
1f6b2343-2619-429e-b843-dfda8ed66949	\N	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop	Mysore Royal Kitchen (Vijayanagar)	\N	\N	Authentic Mysore Masala Dosa, Kesari Bath, Veg Pulav, and traditional filter coffee.	\N	\N	{}	+919900000201	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:45:30.823+05:30	2026-06-01 23:12:29.072+05:30	12.32450000	76.60300000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "pradeepface1@okicici", "connected": true, "updatedAt": "2026-05-27T04:37:41.143Z", "merchantName": "Pradeep"}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	20.00	200.00	15	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA/FBMVEX////cAAAAAAAaGhreAAD//v/aAAD8//////3XAAAbGxsYGBjVAADNAADSAADv0NARERH39/fw8PDQ0NDIAADacXPd3d1cXFwMDAyZmZn/9fOEhIR2dnatra3f398ICAi7u7spKSlLS0vIyMh+fn6ioqKYmJhtbW2zs7NjY2OQkJA9PT1XV1fdjIjp6elMTEwyMjLemJXKSkn/7+3UdG/QX14tLS3ww8U5OTnPQEDILCr+4uHjtrXep6bOcnTaU1LKFxffgoK/AADuyL/QHBjMV1SxLi7YV1Xenp/MTEvej5Hw1c/OIyrcc3XRiIj86OnGYmLKNjnptK6/TUyZDMkXAAASdElEQVR4nO1dCVsaTbPtGWYVhnVEZBFkEUVBEZGwmGCMX4wmMXr//3+5daoxEUTjQgDfp08SInvXVHXVqeruUggFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBYV/B1uYjhCOBB7ArUkP8+PvGyZL4pjCMVkilhO3Jn7AUwse4AzAMpJIthSQ4Zgspv0fEdAWUox0PzI4+fmx/anbG/re8NPPCD37/q1UmKS52NXt6afhZ881DENzLY1gaIbhdc+c/4ASbafz8YvnWiQSS2ZYlqXxz/SIV3dwARJAshGPLXqwr4ET6XoklEuQoo1AP2iapbnnadsWlajOiG6uZXKJdyZn+n9fer2bbvfT16/n7Xb718ePpz8vmxfNi4uTyzAEPTRtckQbhcJ2bj27tglBD8qF+KLH/Xw4j8+ziMfW+i1ts7OViG0UMkWSsljZmMfwZgA7/Sg6YQNOx+12zIk3xUqZYxIy9y402frs+/SX8Fn+dw8a3I9lWKFevdP6/Q7wAEKyRpOz/A4U2fLJxbhTYMG93sUN1/W//2heDCItRzAxYHJQ2tH1vcSCBfgrYpGrq8h0XIa0UfxgTdJN2PO/fyV92jKMkgPK6PpactEyPI0nAvrAZSWSKi14HIPvER8Ied3LK0fYNvhOvKbr1XcxH6dgIHWoWZbBLseSUkJgLfy93h9NyXhW1yuLHusTSB8drU7Hj0+WFAwmSj+4rlQjSA/+974OYjbbarKo7y6vy0n7bth1Q4RwKAQPw7e470K00Rz0huf1k5PLj4fE7yA2zNbQwr0TMB6SMrfEakz/rD+GHy77F83tNft3EdG87tS7vuTm9FxoeCKYDzSK+t6Ssrn7WeHEE1dhVqHXdMipmFwGMCnVsEVr0PZCGoyV4kivg2eFII+znE41Nuh0IogXV/3r61arJekMFzMiIfBS75avAiWKSDPgW+B+07eH3iiGeEfX/EklXd9erCzT4fzyw2HPC9MfuqUf/S/AcDj8/h1Tzjt57J1Xq54mXas/EGDnjWN9fZ5DfyZs56QXhrmNQoExihCaHL03eMSITYqH/SMPrtYwwkdp+iQzVtQz8x3937HNFadI/dsXj1iaNUoNZZaIqHdzJSZZ928gK7lqhzWOHTd9LnhU9ew8h/93ZPUCHA15/PTVoPnja2/42fe4lgHK7d+cmI86IgE6RDIOhhQrSUivw6/MLpeIGRqOA/do3snhtPqRzuDkpNn8eXHbF+w5H4MN1+PY6aMwFG54F/xodpkMdV2vYj45cJNPZcJ/w8BnYheu8+WoLo+72db3IZesAptPKOspwIrt6xuLuWrdth3b3F+WoJHUD2LkHcjObCbQj3qUJ8GlYzvdDtPEdUOsRftgOUJ/TNcbELA+bEZiTyZRTwOLATSVT8MgsSQiOdSGri8DgdvTS7DNE49pdd9+pYwmSsaoxjU9Cv1G+AQilvS9GY/2FajoNRhmx0dcDzft183C+2iGUWD1OiiS1xafaWzoRazFtL6QbWnu5UzW0JpMjYYtmtaiuPCpWKRJSDTrEKTL/Yi1mTfLaIuPIQr+xqHDU3F3JuN8NSrSin7Cybtt9qRviIcSpm23wd/cOuZ0ZbF2GoeNjmraRi+NcMHJwdtARt9DWPQimNRFfZHlqSrNEqJbPdBPGs9s1s9wla48OC5cM5FYJEFN0pcjErou2dSFbb7djzKI4YoLF6lXHdXU6gKdzRoZkGP3OX89Z8Y2CyD3t8U5oqLfJ5uP62sz+dxXIEHsnyyzjQzJv56VgIJLHPa1T3ZhnOOBjL6ogj9UKGxyMxZsFNd+RmYqoMiLEDlU70yIxSmxgQTOdL4h1t+kZ/zhjpPuYSZ+A9PN6IspE5c52EfAsUKDt8eIcdBUvMWqo3dmI+yXZ/vpz0Nc36Fbuw020531jiemDoc0Ea02rt3OQnKMHOUUQvTDWHjoTJ2AsUYyUcht1crVavmlDh+lmw7Mw+sLVFBzbx7vy7EfxW3dJZbc47TnHhK5rczOhxW57yKfT+VfbGYOXPMNynR1KDS4P7NxPxsNZE0iNqRBuLe2M85Gd0iuVDQYYETzerD2LCsrTUSFk5DhGkOos4Y5P2dUyL+ZdgeM1E9Plp8qemAlECXVyS0lzwxnJV3fHHOa6SFy4TOSMLkA/l08himtgpEe0Q/mmJXuR1eC+n61tr5dSj6fN+9FA2wYd3DsU+xwOIKZbhZnNfDnIo5g6JgeNq0hBRgTsKEHgmNjfRY2SPFj7MWhUESE0Id9ZOaeYRTYkyIYGt8fBIqSHgi8fOJk8oHo8fhDzne6guEz/sjCK0f6WpRBusUlFnCPHoSKmr4SfXlqTp4pNa54xz7C0ked6fe8g/5BEYlNlxibe/bgyckJ9SwU9JVJxTvijJIo8Ama9wevH+xrEKNpaDoteNLPrYdPBgNsxC/CWnQlOsGwHdH6jIU5fENmzrQmgWnhRLCU0n1QIKVpGMy/dDzx6ZelS7QmHBFQ8XxTqByXLy6wn+v0gYRwGS927jm6LNEJ+k7z4BQbHLAYtTFn4iZt5lSzrNDJAwmDwVdMQ5q7qSkFmZMQifhDwPTn62r2NnGL1DAcsScIzQZihWTasfhGolQobBfICu+/JPbAhht406SRkg+9oohofcOdzfmmwfx1zneUL1qTqzEVcoqp9Vp1f/dYH6FYKurHv8efJNq6NfGBMNLUhNz42GusYnDEXdv8J5I8glgUBpUmRuN64xpMru0GiZMG8noqGg1K7h3VN/Uo3RbkS0p6Khj8UyJsVNZLMNKV1M7EtzjMmpBBoYKQDc44yX4ScdZB36d4fGOOFRETJMsdVgIrQUosSIM1skEicpJWl/J47s5xbLCO4zDSSVeCwqlzA2qPHHF9rrytwaO58u4KKX9g6lJvwWg0RUNPFTMFiuI1Eiq4EpVLZQnin0GSVw74IEpXIrVL12V6MeYb9hohXOTmWqxJ8vozivlae2IWFvJB2OhBcS9b207KmVUgDUXJejmkxVMk3vHmiJpj0kajAXpPMPXga1CfbHM5XWAtfZ6FYQ74ouNxbjNRJ82mAqnymEE1SK/BzdhmMI/dFcUUXG05FQUNM4NBmn/7sOzUQ1+JxaePRCq8jph3yE+wY0cdxTidXIopEiktjD1STa1AfTtR0PFtzLgafCdIKKXKwRXEQtL7w50XkPAU2cWCJRxPfsUmWeOYCpMkU6oKdxkkh/+BkuMVE6KR1Zl4cQFvCUxeFgDV/d8SluYsIYbTAS09epj9RscX37N5zhaRFh/IDGIbVQB4FlJodB+uJzA1oWQdIlosQocFgXlInubowVOB8ZoKBwKagFskzY4gpxn9wK8COad7ZA0fOILq079qFWXh+VPv377UMCaiBdQyPpQtnSMD07JtWCyuDolGAZ7uBYOULwfI+UDuh7DFOeqx8/elMh5SxDe07sRT63pwfBoey3SY5l90BYEx+AHEPYDrQElIvkw0Vif/G51kNACSbGsU8ecbD+O85awFCYfO+Dws54NjBJKrUvH4fp7nH8V3us3oKyv5Kjul/PaHIEWSoIwkwD1ySqTGHFKCBu5LtjBPTmMyLyXmbRl+ejxarKXgN/8A0WGlpkdXAvkdmebWjukhzMIGEwEOLsVoXnJxs/wnwTBtW7Q8y5C1rmx0rkk+cgvH6cKT98eX74vR8bwBfCaQD64g5rPXoTvkWBBu+Kkgh/pMPsXp3/bmPYcDwntF+aHBM2G+uQV/nWOvupoVmtjdvBsdD2wbFB6YqLKj2BxV+tndsoSSoNJkzFdK65Rujb0Zx20My1rFT3PODznHt5s4LnE5LuFBdMIjVFnEqHSw2yOhWM0lGQd5i+UWOSgi6uO1AdOxL7HBvSnmn+OzY7PPcJ7p63i0OI7q4xwnVtRTKf145OozlDf+PmxA7Cagj2YtnxDeHc/yTWF/om8IoV457zoNQr5jX4exX2Iyw3+whlLZqf4ZXam6tnXHXhJ6Xj++ux6xRGKS1ZArRQrqXdvzr7WhXuqYZo+IaSgybqYvycQT1fJTxX9HrqH3cA1r814GPtjFJT7Cbq/Lf/YlNpYNLO0UV213zjVvUaZL6vDRSav7z1pCmKKLzUgDIRawboG1J5PiMYrufRwC/Sci9j1jxGjmv/YU54UL+yvO/TSFM2WvUCy7VxHZx9zD+nM8owxH5zDS+a8fin2sAdu3LhG3HvK4BzrMVUUDEq6v5US8ms2KZLXaEOXsDnuMyt5aSTSy2bgoV81ktTzNP9lOD4fauKh+PPc1YIoKSXQZQKkm3JksewOx8octkjBZFB8atVxMF/HtnYo4TmZYe5Xaxq5YW89kxEpS7OaqU5fpO9gO7bVMsZB1/A1JPyhBtYxzPkowgWQiqZOEjc2Nzfj2Xk4Xta3Mljg2KzzW9VzsQGRrhQ1BtrCX254MGkzn2waZyCrNcooVC9j3VeT9NGdYV/D6UzbtNbYyG6LQEKVMQsQKhU1BmkyInEjw1EwkYjlhVrbiggSOba1PXiDyztjWqVnhMwgbnL+R3u2JovyCYuLqX17byFZfyEhMxyT7oGDYxX7axeyJisl9bbd8Futq5jv3HBsldSN0i22di9nXJvcmCvJ3RE7bs/945xxHT7/DSy9obyL5Gi48nISkO+VkZ2YfbosOdtCGTha5v1Ts8R5hBC1Lk0cRZmeqNjbQuhRqnQXuEabkB0eesLfNsNz65P7EN6JuuZrB+2cpVCyssQs2emMrO1oGeBHbnGHDMl65034JVuHiDrDhvAUNAdvqNdjp7Kw0Db6m+dcgS9nFqVDcHfaAs9HIn9qmOYMN+yC5bRykCl/gZMJCz8zcnXsS5+jMwiexnLebqo1TOIbmal/5HNxizz0R/wbZsK+HaMMSHsxiQzvF+gGW7bQvLZx+XvDZNSF2OeyTP0VzHb/z2jOy9yA3HmtY+CW+tvDzh6MzpI7d5LZ6fuQtx/EBBwdu0bGGD9zaS3CGVJ4DJu9y5GosIp9gc14pJ/zUmc+9ND4KWWFb+Dng0Vlux3bOue0cGSp3aX2lJk3T/umj5dK5g9izFGe5RSxPU5FETHe5nad3KzczveqzTBC/1pGnHabhkhv65EawxSCpH8dIcU6aU0XLO0Ufj9dJ6Mhr0/m/Fhms6SxJTwUstxQx8+z0Nxz8dN1vLXmI8PF3OH+0bHKzpbvHedGQGxHTn6XpizHqbYJ8oI3Sm6Z9GaBTzRPuBk/RdG0N6u2bIXDTrt9ec2ONP4RhiXqbyP407G5OQ/A3WvjXtWxx/RhITebg3A/LLrzcIyrs3TT79p9GPUvVn0Z2BDKhmRMP/YMNy79wHm8ggbaXnRtPdr/ibnyyK6/mH/XvVnbKy9VjCCJWMTTTjvS4AaTl9gbO4wtRrTY3bWXxZN9PvuNqfp2t1Fy6PlEw1H2TGyqkj2RPXSPUHcg84/duDceWvkSc+NyiTrZO5IZgsqMyzeLQIVp+bi+XiUqs6wcNqbSz7zx6UsmweY3encKWx/fQZolecHWI0s5IfWMwoP4hvUcsjRe9j219tBXdTtc92czTsrzz2xZPSIe9K1oMrqInpPWohJbWNd/O3/8NknKDOuTpt33Zls4yXO9T8ywte53Z6UHbc7VRi++pEmrcBGZJJRSxPb3Y4Hq1LSJtbtwl5Qh/7q02B2fNtu+ymqxR59KHEnKDN3/WZ99niAq3H5XrpVc/vBCHDv6nuSFXincXA6dBdrBzb2dXeJ05Nnb1IheOsGh6fdH17pmk9aeb4lMgKeuLFuNJVEYNj7lzm9lv3viyeSJyK1LP3yXUeFvuMiNe1fUMV8MdLrxdD067nme5+GUQU2ffAwm15dahwMEZknED+ayQq8NOi/tFes/RoMYlraVHgmTckdGRf82M9Bwt7jdrGO7UUKFxR2H889NL7Gl+Y6Os66nMRAbL8V5jCjo14qOzOUXQ5jv5fSax3L6ub2ZKvwsR3FrRvmp7koFO1SFkPJztGs8/RaPCv8EiU0j+FpMMttNzZWfaKUCXjZb9rn7rTrxQ/oDjaZtr2fXc9nack99L/xGvSkqk3GKG65BzQiyRy6xtBvmwZY1XIfrnYe6qP2ICnFNwNuU3nfelwfsw441kIiH7l9h2p+uNckRO9C2+9SjH/w/8+jKB5SXTdiKrn8Oy2770oH734lrMYOFjSeAgX0x3mu3u0PP8YbfdHFxDteas2totGia2NUgi4DhpdizcdNFc2uT3pXh3zlJBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQeG94P8BMk55Ts5xLSEAAAAASUVORK5CYII=", "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff", "stateTaxRate": 2.5, "centralTaxRate": 2.5}	\N
2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	\N	https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop	Royal Heritage Supermarket	\N	\N	Convenient hypermarket for daily dairy products, fresh bakery bread, packaged foods, and household cleaning supplies.	\N	\N	{}	+919900000204	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:45:30.863+05:30	2026-06-01 23:12:29.058+05:30	12.32150000	76.60450000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
494f78a4-8b1c-451f-af8f-c41995696ae1	\N	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop	Idli Mane Vijayanagar	\N	\N	Softest Tatte Idlis, Button Idlis with sambar, and home-style podi dosa.	\N	\N	{}	+919900000304	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.556+05:30	2026-06-01 23:12:29.061+05:30	12.32500000	76.60400000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
09dacbba-d0e7-4862-8a77-e8bded1ea387	\N	http://10.0.2.2:3008/images/bakery1.png	Tubulu Master Admin	\N	\N	\N	\N	\N	{}	+919999999999	\N	SuperAdmin	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-09 15:34:03.95039+05:30	2026-06-02 11:44:36.359+05:30	12.91410000	77.64120000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	630490	2026-05-19 16:43:59+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9098946314	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
880be692-42e6-45c2-b8f4-a14ba85a3a9c	\N	\N	Pending Onboarding	\N	\N	\N	\N	a16d0c16-dec4-41af-a74d-7ea599a86344	{}	+919900000000	\N		t	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-06-02 10:41:12.19+05:30	2026-06-02 20:10:30.963+05:30	12.32370080	76.60227780	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	586053	2026-06-03 10:41:12+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
c36bc6e3-08de-42d1-b37d-ac439ec1d6c4	\N	https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop	Cauvery Supermart	\N	\N	One-stop shop for packaged juices, tea leaf dust, dry fruits, and cleaning supplies.	\N	\N	{}	+919900000404	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.586+05:30	2026-06-01 23:12:29.064+05:30	12.32520000	76.60080000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
3a15184a-8dd9-4f88-99d9-b43781c3a6b1	\N	http://10.0.2.2:3008/images/bakery1.png	fsdgfg	\N	\N	\N	\N	6f3fdd03-2e37-4907-bfed-1f6d0741803d	{}	+918989898989	sgfg@g.vom	AI & ML	t	t	t	dfds	gsdfgdfsg	gsdfg	Andorra	454545	sdfgdfg	\N	\N	\N	{}	\N	2026-05-10 15:42:14.557+05:30	2026-06-01 23:12:29.066+05:30	12.91410000	77.64120000	sdfgdsfg	t	t	\N	AI	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-15 18:21:33+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9133891923	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	\N	https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=600&auto=format&fit=crop	The Gourmet Pantry	\N	\N	Curated selection of fine European cheeses, bronze-cut pastas, organic honey, olive oils, and spreads.	\N	\N	{}	+919900000002	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.419+05:30	2026-06-01 23:12:29.067+05:30	12.97550000	77.59950000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9052735523	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
37f3f942-8dec-4e17-8e90-c62f9cf2717d	\N	https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop	Nagpur Coffee House (Tilak Nagar)	\N	\N	Famous filter coffee, fresh samosas, idli, dosa, and classic local Indian breakfast.	\N	\N	{}	+919900000101	\N	FB	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:24:51.242+05:30	2026-06-01 23:12:29.07+05:30	21.14800000	79.08400000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
f0fb8be9-0626-436f-accb-c9eda11d0b08	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Gokulpeth Daily Grocery Mart	\N	\N	Local neighborhood supermarket supplying fresh farm vegetables, pantry staples, spices, and household essentials.	\N	\N	{}	+919900000102	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 13:24:51.295+05:30	2026-06-01 23:12:29.071+05:30	21.14500000	79.08100000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
5435a027-bf16-425c-af23-3f7c858cc9e0	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Sri Manjunatha Provision Store	\N	\N	Local neighborhood grocery store for spices, flours, grains, and kitchen essentials.	\N	\N	{}	+919900000401	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.571+05:30	2026-06-01 23:12:29.074+05:30	12.32300000	76.60420000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	\N	https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop	Vijayanagar Organic Farm Fresh	\N	\N	Direct-from-farm seasonal fruits, leafy greens, and exotic vegetables.	\N	\N	{}	+919900000402	\N	GROCERY	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.577+05:30	2026-06-01 23:12:29.074+05:30	12.32480000	76.60180000	\N	t	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
19106bf7-bf42-41c0-910f-5ca7ab302313	\N	https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop	Cafe Heritage & Bakery	\N	\N	Artisanal breads, cream buns, hot pastries, and specialty tea.	\N	\N	{}	+919900000302	\N	FB	t	t	t	\N	Mysuru	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-24 14:11:55.542+05:30	2026-06-02 11:44:36.354+05:30	12.32420000	76.60100000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
5c893a1b-65b9-4fb4-9365-61d877bacfbd	\N	\N	Pending Onboarding	\N	\N	\N	\N	1733783f-8d37-4980-967e-caf0eda68348	{}	+919900000205	\N		t	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-06-01 16:52:55.522+05:30	2026-06-02 20:10:29.048+05:30	12.32370080	76.60227780	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	717884	2026-06-02 16:52:55+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	\N	\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	\N	\N	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
f1665785-dab5-4a4b-a543-109b62e9af4a	\N	\N	Anand Bakery Indiranagar	\N	\N	A legendary bakery famous for filter coffee and amazing cakes.	\N	\N	{}	+919999911111		FB	t	t	t	Indiranagar Main Road	Bengaluru	Karnataka	India	\N	\N				{}	\N	2026-05-18 20:45:35.626+05:30	2026-06-02 20:10:30.961+05:30	12.97256580	77.65078480	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	07127191144	sk_e9t1g5v5_FbbZFijvIdWYoj6SE6JUb82g	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	\N	\N	Fresh & Fast Supermarket Staging	\N	\N	\N	\N	d7d832f5-9df5-413f-8a10-3748c9658a78	{}	9876543210	\N	GROCERY	t	t	t	\N	Bangalore	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 12:20:51.16+05:30	2026-06-02 20:10:31.952+05:30	12.97679360	77.59008200	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f	9678169620	sk_e9t1g5v5_FbbZFijvIdWYoj6SE6JUb82g	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	\N	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
77b5fc71-e3e9-4a0e-9ff4-58cb81710100	\N	\N	Mysuru Gobi	\N	\N	\N	\N	eaf96707-5d1a-494d-af3d-b4a36fc304dd	{}	+919800989800	\N	FB	t	t	t	Peenya	Bengaluru	Karnataka	India	562123	\N	\N	\N	\N	{}	\N	2026-06-02 21:51:56.442+05:30	2026-06-02 21:51:56.46+05:30	13.03989700	77.50782900	\N	f	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	eda5847c-55a5-456a-a166-996a95a6be3a	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	20	f	f	f		\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	\N	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
e05735a9-b1eb-444b-84bc-db352b6688b8	\N	\N	Mysuru Organic & Groceries	\N	\N	\N	\N	e94f63ce-7e67-415c-9bea-8324eb3685c8	{}	+918908908900	\N	GROCERY	t	t	t	peenya	Bengaluru	Karnataka	India	562162	\N	\N	\N	\N	{}	\N	2026-06-02 21:54:12.491+05:30	2026-06-02 21:54:12.501+05:30	13.03989700	77.50782900	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	bc349e5f-11a0-4020-9150-841d9ce04680	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	20	f	f	f		\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	\N	0.00	0.00	30	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
eda5847c-55a5-456a-a166-996a95a6be3a	\N	\N	Mysuru Gobi	\N	\N	\N	\N	4b79f67d-fe64-4133-9965-47100a670536	{}	+919809809809	\N	FB	t	t	t	Vijayanagara 3rd stage	Mysuru	Karnataka	India	570030	\N	\N	\N	\N	{}	\N	2026-06-02 20:34:49.7+05:30	2026-06-02 21:21:27.432+05:30	12.32423600	76.60609600	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	20	f	f	f		\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	\N	30.00	150.00	10	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": "", "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff", "stateTaxRate": 2.5, "centralTaxRate": 2.5}	\N
2274fdcf-4283-4681-a87c-f56834b6f0c0	\N	\N	Dosa camp	\N	\N	\N	\N	5cd86f2d-74dd-422b-af0d-f404d4a37432	{}	+917897897890	\N	FB	t	t	t	viajaynagar 3rd stage	Mysuru	Karnataka	India		\N	\N	\N	\N	{}	\N	2026-06-03 11:51:20.093+05:30	2026-06-03 11:53:10.387+05:30	12.32406800	76.60678200	\N	f	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	20	f	f	f		\N	f	{"friday": {"open": "09:00", "close": "22:00", "isOpen": true}, "monday": {"open": "09:00", "close": "22:00", "isOpen": true}, "sunday": {"open": "09:00", "close": "22:00", "isOpen": true}, "tuesday": {"open": "09:00", "close": "22:00", "isOpen": true}, "saturday": {"open": "09:00", "close": "22:00", "isOpen": true}, "thursday": {"open": "09:00", "close": "22:00", "isOpen": true}, "wednesday": {"open": "09:00", "close": "22:00", "isOpen": true}}	\N	30.00	200.00	15	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d	{"logoUrl": null, "gstNumber": "", "footerNote": "Powered by Tubulu", "headerNote": "", "primaryColor": "#007bff"}	\N
\.


--
-- Data for Name: LoyaltyTransactions; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."LoyaltyTransactions" (id, "walletId", type, points, "orderId", description, "createdAt") FROM stdin;
4834f30d-8941-4367-9ca3-99324daa15bd	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	3	2241be25-a61f-4bbe-9ec2-cf25e5d0a2b3	Earned 3 points on order #2241be25	2026-05-29 20:49:14.072+05:30
82129094-3ed1-4721-a2e3-f7de30674b54	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	3	5b47bfb0-18f3-48ca-a746-7b9fb4af411b	Earned 3 points on order #5b47bfb0	2026-05-30 09:32:26.481+05:30
0566db5e-4660-4a17-ab87-16045f143212	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	ece64cef-d7a7-4acc-b5e9-c7516a1b13ff	Earned 5 points on order #ece64cef	2026-05-30 09:55:48.795+05:30
268fe987-4e04-413a-82c6-f960cca8035d	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	30	b56b0128-441d-4ae3-8910-6fd6ced800fe	Earned 30 points on order #b56b0128	2026-06-01 12:51:27.537+05:30
05466a6b-109f-4783-aba4-0fe0fa83b6af	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	2b9fbf2b-d57e-482d-9bd0-b48a6d0d3562	Earned 5 points on order #2b9fbf2b	2026-06-01 14:12:24.988+05:30
21ee1051-6a03-4d5e-9b39-fc6aac2d3985	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	fc4b49c8-80d3-4982-84bb-a18c19e380bc	Earned 5 points on order #fc4b49c8	2026-06-01 14:25:11.184+05:30
fa581907-d39a-404a-baba-019536d4b08e	6f21857e-15f3-4d95-88b7-c704b378703d	earn	11	21e276e6-c7b3-4047-b260-e667ca0e963e	Earned 11 points on order #21e276e6	2026-06-01 15:12:04.951+05:30
a03ac0f3-f278-4b14-a5ab-f58f9039d3f8	925ad103-bded-45de-9790-9398565c6180	earn	10	780cc1c2-291d-42ac-9ece-a18e21a2f891	Earned 10 points on order #780cc1c2	2026-06-01 15:15:23.246+05:30
066a6084-1c7c-4d5f-8c6b-ff4c12a29b1e	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	c9c0d0b4-b8ae-4b4d-b704-0d2e78a253f2	Earned 5 points on order #c9c0d0b4	2026-06-01 16:57:33.657+05:30
226e0868-033e-44b5-8064-9abc05fdccbd	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	25	0c8a2a20-291b-43f1-b7f6-4794cd5790c4	Earned 25 points on order #0c8a2a20	2026-06-01 16:58:16.767+05:30
6780870b-0a6d-4c1d-b551-e226400036ad	6f21857e-15f3-4d95-88b7-c704b378703d	earn	5	a5b71bd6-761c-420b-8d58-fa088bcc542f	Earned 5 points on order #a5b71bd6	2026-06-01 17:28:51.908+05:30
3c9ff521-519b-4bf8-befe-50e1aa742fa8	6f21857e-15f3-4d95-88b7-c704b378703d	earn	11	6e39d440-64a5-4c4f-9595-7962b1ddd1aa	Earned 11 points on order #6e39d440	2026-06-01 20:29:46.973+05:30
e986c72a-f725-479c-a61b-ee352122ff2a	6f21857e-15f3-4d95-88b7-c704b378703d	earn	5	b26097af-49ac-4611-ad84-8447914650a1	Earned 5 points on order #b26097af	2026-06-01 20:40:52.374+05:30
c43bf919-70a6-4865-ab83-650ce3db44a3	6f21857e-15f3-4d95-88b7-c704b378703d	earn	5	bb455048-19b6-4cda-8077-b0a6b9421f54	Earned 5 points on order #bb455048	2026-06-01 20:49:19.424+05:30
209cb8a0-3715-4330-a56f-ff6cc6e4b78f	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	9505b6b0-665f-4b8b-b6b5-263a29a42a02	Earned 5 points on order #9505b6b0	2026-06-02 11:00:09.264+05:30
5f0a7833-ce14-4844-a8e1-647d748e05dd	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	11	353dfafd-8463-4c4c-9272-1ac397bbed95	Earned 11 points on order #353dfafd	2026-06-03 12:38:24.727+05:30
6d65508b-3b0f-46cd-9920-d5ff12f5c5a0	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	a0dccc6f-1d1d-4761-9624-45cd0964ba4d	Earned 5 points on order #a0dccc6f	2026-06-03 12:38:27.49+05:30
baf816bb-0fcf-48df-9158-cbeb7a5b048d	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	9a632145-2c9a-44ac-a732-c95e9375214e	Earned 5 points on order #9a632145	2026-06-03 12:38:32.832+05:30
0d416460-0a3a-4d0d-ab2a-033c6c4b8a1b	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	11	a22760e7-5cb3-495d-99f5-8636b61ac2e8	Earned 11 points on order #a22760e7	2026-06-03 12:38:37.506+05:30
2a0de77a-f646-4f1b-9e26-0c35ee10be32	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	f449f7d9-0a53-4133-872c-e965a43ea019	Earned 5 points on order #f449f7d9	2026-06-03 12:38:41.303+05:30
5483cddd-c623-41b6-a346-6acf465d3396	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	dd8f7d04-017d-4f8d-8295-bbda4e05d747	Earned 5 points on order #dd8f7d04	2026-06-03 12:38:46.025+05:30
af553e1a-557c-4ad0-8960-75deac7d2346	50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	earn	5	b33b4510-b7bb-4116-b841-6f0140fc0be2	Earned 5 points on order #b33b4510	2026-06-03 12:39:45.207+05:30
\.


--
-- Data for Name: MerchantMemberships; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."MerchantMemberships" (id, "userId", "integrationId", role, permissions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Orders" (id, "mongoId", "userId", "integrationId", "cartId", "catalogueId", "addressId", "orderItems", "discountAmount", "totalPrice", "totalQuantity", "orderMessage", "deliveryType", "paymentStatus", "paymentMethod", "razorpayOrderId", status, "isActive", "createdAt", "updatedAt", "statusLogs", "acceptedAt", "packedAt", "dispatchedAt", "deliveredAt", "personalNote", "scheduledFor", "isRated", "cancelReason") FROM stdin;
5821df2b-ab0d-4ee9-a0de-de3ea542d402	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	12d6fedd-e5b5-4aa7-9836-8b572071ff9a	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Margherita Pizza", "sgst": 0, "price": 349, "total": 349, "quantity": 1, "productId": "prod_2056c34994815b36", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Pizza", "customizationDetails": []}]	0	349	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-11 11:07:17.197+05:30	2026-06-01 15:15:35.398+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T05:43:04.950Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T07:07:33.423Z"}]	2026-05-11 11:13:04.95+05:30	\N	\N	2026-05-11 12:37:33.423+05:30	\N	\N	f	\N
955a75d9-65ba-40bb-af7f-dabc637ade3d	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	0b49cd3d-7a15-49d6-a5c4-383d74efef73	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-11 10:34:56.009+05:30	2026-06-01 15:15:35.403+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T05:05:16.568Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-11T05:05:51.303Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T05:06:02.954Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T05:09:40.459Z"}]	2026-05-11 10:35:16.568+05:30	2026-05-11 10:35:51.303+05:30	2026-05-11 10:36:02.954+05:30	2026-05-11 10:39:40.459+05:30	\N	\N	f	\N
f1950d76-b55b-4d2b-a0d4-6158440cf18c	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	e9fc2e70-50be-4f09-82b9-b713a865baa8	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-14 18:02:31.228+05:30	2026-06-01 19:56:59.843+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-14T12:52:32.505Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-14T12:53:22.186Z"}]	2026-05-14 18:22:32.505+05:30	\N	\N	2026-05-14 18:23:22.186+05:30	this belongs to my son	\N	t	\N
665a1c67-acf6-4f61-b938-c0b2c0ca8d9d	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	28a20cd2-6763-4e0e-917c-a2fcb5e1ce0f	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-11 12:31:08.448+05:30	2026-06-01 19:57:13.106+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T07:04:43.857Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-11T07:04:48.148Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T07:04:56.174Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T07:05:16.909Z"}]	2026-05-11 12:34:43.857+05:30	2026-05-11 12:34:48.148+05:30	2026-05-11 12:34:56.174+05:30	2026-05-11 12:35:16.909+05:30	\N	\N	t	\N
fde2e836-7985-4e29-a675-5447b6903035	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	6e673c22-8502-4e84-ae29-9e26bb08c732	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-13 17:48:52.401+05:30	2026-06-01 19:57:10.92+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-13T12:19:21.882Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-13T12:19:33.112Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-13T12:19:44.134Z"}]	2026-05-13 17:49:21.882+05:30	\N	2026-05-13 17:49:33.112+05:30	2026-05-13 17:49:44.134+05:30	\N	\N	t	\N
99fb082e-0bcd-469c-a43c-45683104ab0b	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	142724e8-a252-49d6-82e8-ed08ef25b2be	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 318, "total": 318, "quantity": 2, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	318	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-11 13:34:14.888+05:30	2026-06-01 19:57:12.674+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T15:37:33.329Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T15:37:38.844Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T15:37:47.950Z"}]	2026-05-11 21:07:33.329+05:30	\N	2026-05-11 21:07:38.844+05:30	2026-05-11 21:07:47.95+05:30	\N	\N	t	\N
805a7b32-99ab-4ca4-b621-b7de57bbb044	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	89672f69-97f4-4c7d-9802-bf7f8a8bda03	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	paid	cod	\N	delivered	t	2026-05-18 17:59:47.588+05:30	2026-06-01 19:56:59.193+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-18T14:53:06.974Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-18T14:53:16.912Z"}]	2026-05-18 20:23:06.974+05:30	\N	\N	2026-05-18 20:23:16.912+05:30	\N	\N	t	\N
92a7bc6c-72e7-45e7-a0ad-d3145b08ab49	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	6beb238a-6eb8-4c51-9fc7-2763f60dcad6	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-19 17:49:41.18+05:30	2026-06-01 19:56:58.028+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-19T12:27:43.423Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-19T12:28:05.369Z"}]	2026-05-19 17:57:43.423+05:30	\N	\N	2026-05-19 17:58:05.369+05:30	\N	\N	t	\N
e6f975b9-c573-4981-a352-f545baff12f2	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	79aabc89-56b6-44eb-836e-fc9aba2e62ec	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-22 22:54:15.141+05:30	2026-06-01 19:56:35.894+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-22T17:24:29.093Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-22T17:24:50.811Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-22T17:41:48.072Z"}]	2026-05-22 22:54:29.093+05:30	\N	2026-05-22 22:54:50.811+05:30	2026-05-22 23:11:48.072+05:30	\N	\N	t	\N
2cd5c544-90c0-4e80-9df9-64be2aadab8b	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	f0034628-09d6-45db-937f-956bf32a0b59	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop", "name": "Margherita Pizza", "sgst": 0, "price": 349, "total": 349, "quantity": 1, "productId": "prod_2056c34994815b36", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Pizza", "customizationDetails": []}]	0	349	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-22 23:21:16.612+05:30	2026-06-01 19:47:36.605+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-22T17:53:20.783Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-22T17:53:24.100Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-22T17:53:26.855Z"}]	2026-05-22 23:23:20.783+05:30	\N	2026-05-22 23:23:24.1+05:30	2026-05-22 23:23:26.855+05:30	\N	\N	t	\N
17f8c5f1-58ea-48f2-9cd6-8cb68cc39d93	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5ab3f685-41ab-4e97-92cb-7fd6ef98c7a4	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:08:05.51+05:30	2026-06-01 19:45:39.234+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:38:41.766Z"}]	\N	\N	\N	2026-05-27 10:08:41.766+05:30	\N	\N	t	\N
bc0b2129-ba97-4d3a-942c-a5cec9682bcc	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	57894d5b-b568-401c-a160-f375ae316bf3	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	90	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 09:31:44.486+05:30	2026-06-01 19:46:51.623+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:02:01.847Z"}]	\N	\N	\N	2026-05-27 09:32:01.847+05:30	\N	\N	t	\N
78e7fc96-11cb-4f2a-aa31-788fca3f2944	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	2332b799-81ec-43e6-82e7-80283944d60a	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 09:28:05.559+05:30	2026-06-01 19:46:55.025+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-27T03:58:14.418Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-27T03:58:17.657Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-27T03:58:19.568Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T03:58:21.661Z"}]	2026-05-27 09:28:14.418+05:30	2026-05-27 09:28:17.657+05:30	2026-05-27 09:28:19.568+05:30	2026-05-27 09:28:21.661+05:30	\N	\N	t	\N
1423c072-0264-4782-9b98-267b2da2a448	\N	964c8fa7-d191-4ebc-adc8-9790b2b0197f	908fa830-7d67-4555-8d3b-a72b20636d44	0503eef4-fbd7-49b8-9f55-99ed289e4c39	cat_8bd8822dbd89da8f	\N	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop", "name": "Grilled Chicken Sandwich", "sgst": 0, "price": 210, "total": 210, "quantity": 1, "productId": "prod_8c0e42a6419dcdf6", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Sandwich", "customizationDetails": []}]	0	210	0		"Delivery"	pending	cod	\N	waiting	t	2026-05-27 10:11:02.397+05:30	2026-05-27 10:11:02.397+05:30	[]	\N	\N	\N	\N	\N	\N	f	\N
9dfaf32a-4ebd-40d8-a74a-0386bb9c7f28	\N	964c8fa7-d191-4ebc-adc8-9790b2b0197f	908fa830-7d67-4555-8d3b-a72b20636d44	65a5d739-5980-4097-b004-ba552e61e15e	cat_8bd8822dbd89da8f	\N	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop", "name": "Grilled Chicken Sandwich", "sgst": 0, "price": 210, "total": 210, "quantity": 1, "productId": "prod_8c0e42a6419dcdf6", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Sandwich", "customizationDetails": []}]	0	210	0		"Delivery"	pending	upi	\N	waiting	t	2026-05-27 10:11:02.436+05:30	2026-05-27 10:11:02.436+05:30	[]	\N	\N	\N	\N	\N	\N	f	\N
38d0cce2-6032-48a3-9c51-21093e81b9d1	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5e5bd580-bc89-40ba-81a5-2d65e963f554	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	90	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:11:24.696+05:30	2026-06-01 19:44:03.067+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:43:26.273Z"}]	\N	\N	\N	2026-05-27 10:13:26.273+05:30	\N	\N	t	\N
5e1862c1-c7f3-4a62-a0cc-ca84b6003478	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	ba775900-95bc-4bb6-9c67-f346c33f09fa	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:11:04.236+05:30	2026-06-01 19:45:37.119+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:41:10.312Z"}]	\N	\N	\N	2026-05-27 10:11:10.312+05:30	\N	\N	t	\N
7531bf39-4245-4e0c-92ef-82d4e3fb14d8	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	48f5be43-6c47-4cc3-920a-8d1455359e3b	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": "0", "logo": "http://localhost:3008/images/b5402c30-042b-48f9-9019-c340147543d0_Rameshwaram_Cafe_Dosa.jpg", "name": "Dosa", "sgst": "0", "price": 75, "total": 75, "quantity": 1, "productId": "a74f3bcd-8eed-4271-94e7-ed0ff7807f36", "otherTaxes": "0", "specialRequest": "", "product_catagory": "Food", "customizationDetails": []}]	0	75	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:13:09.061+05:30	2026-06-01 19:43:59.352+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:43:21.687Z"}]	\N	\N	\N	2026-05-27 10:13:21.687+05:30	\N	\N	t	\N
f5eddce1-2ad1-43ab-8149-809613a3278b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	6bc23fb3-a559-489a-832d-b5e7390142f6	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:17:02.814+05:30	2026-06-01 19:43:58.802+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T05:00:02.182Z"}]	\N	\N	\N	2026-05-27 10:30:02.182+05:30	\N	\N	t	\N
40a48b88-91cd-43b4-9e4e-2ccd8bb3095a	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	deb98c8d-dc29-49d3-948e-bf9b4de7889d	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-05-27 10:48:12.578+05:30	2026-06-01 19:43:58.083+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T05:18:30.078Z"}]	\N	\N	\N	2026-05-27 10:48:30.078+05:30	the coffee - was really good 	\N	t	\N
93896c9e-6579-4b6a-be45-e5b72dfe8615	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	1c488580-d72b-4a45-b845-0d0e280a2284	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	90	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-05-27 10:50:52.155+05:30	2026-06-01 19:43:57.458+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T05:20:57.003Z"}]	\N	\N	\N	2026-05-27 10:50:57.003+05:30	\N	\N	t	\N
bd0d1b68-f4dc-469e-a416-50911c368be6	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	d5ab917a-2e27-4f9e-9694-6d307989fdc9	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": "0", "logo": "http://localhost:3008/images/b5402c30-042b-48f9-9019-c340147543d0_Rameshwaram_Cafe_Dosa.jpg", "name": "Dosa", "sgst": "0", "price": 75, "total": 75, "quantity": 1, "productId": "a74f3bcd-8eed-4271-94e7-ed0ff7807f36", "otherTaxes": "0", "specialRequest": "", "product_catagory": "Food", "customizationDetails": []}]	0	75	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-05-27 12:32:44.793+05:30	2026-06-01 19:43:54.358+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-27T07:03:02.421Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T07:03:05.280Z"}]	2026-05-27 12:33:02.421+05:30	\N	\N	2026-05-27 12:33:05.28+05:30	The dosa was ver ygood - you need to try it with coffee	\N	t	\N
bc909a1c-1d00-458c-a5eb-e70b18e12931	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	9dbcac46-5a97-459e-8038-9f91333178a4	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	90	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 10:12:49.707+05:30	2026-06-01 19:44:00.067+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T04:43:24.266Z"}]	\N	\N	\N	2026-05-27 10:13:24.266+05:30	\N	\N	t	\N
c9c0d0b4-b8ae-4b4d-b704-0d2e78a253f2	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	38dbb5f6-5cdc-46cd-8cf9-2df7d6a18a94	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	pending	cod	\N	delivered	t	2026-06-01 16:57:28.594+05:30	2026-06-01 19:43:45.985+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T11:27:28.594Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T11:27:33.656Z"}]	\N	\N	\N	2026-06-01 16:57:33.656+05:30	\N	\N	t	\N
371e4a01-2bb8-4ddf-88da-281c2b378c02	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	2beea8c6-94d2-4c25-ae75-3f6fa57968a6	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-27 13:33:58.3+05:30	2026-06-01 20:06:52.193+05:30	[{"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T08:04:03.175Z"}]	\N	\N	\N	2026-05-27 13:34:03.175+05:30	the food was amazing - people who come to mysore should taste it	\N	t	\N
2241be25-a61f-4bbe-9ec2-cf25e5d0a2b3	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	1da16f37-c847-4486-8e8c-a3eb728ca5e1	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-29 20:48:51.818+05:30	2026-06-01 19:43:51.93+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-29T15:19:04.795Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-29T15:19:10.779Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-29T15:19:14.070Z"}]	2026-05-29 20:49:04.795+05:30	\N	2026-05-29 20:49:10.779+05:30	2026-05-29 20:49:14.07+05:30	\N	\N	t	\N
5b47bfb0-18f3-48ca-a746-7b9fb4af411b	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	e2073313-b792-44b2-b4a9-5e1689f70aa2	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-30 09:31:46.61+05:30	2026-06-01 19:43:50.664+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-05-30T04:01:46.610Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-30T04:01:58.378Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-30T04:02:09.791Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-30T04:02:16.254Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-30T04:02:26.477Z"}]	2026-05-30 09:31:58.378+05:30	2026-05-30 09:32:09.791+05:30	2026-05-30 09:32:16.254+05:30	2026-05-30 09:32:26.477+05:30	\N	\N	t	\N
2b9fbf2b-d57e-482d-9bd0-b48a6d0d3562	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	44cfd30f-2d9b-45e9-8a48-fa518c404a27	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-06-01 14:12:19.91+05:30	2026-06-01 19:43:47.663+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T08:42:19.910Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T08:42:24.985Z"}]	\N	\N	\N	2026-06-01 14:12:24.985+05:30	the coffee is amazing 	\N	t	\N
dc29ad83-e63c-4161-8d19-b9b92994286b	\N	0893032b-3193-47b5-a046-c0f762670f46	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	6752357d-9461-4a35-8732-82b1e861224f	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Premium Degree Filter Coffee", "sgst": 0, "price": 40, "total": 40, "quantity": 1, "productId": "30fd9c4e-4e01-4536-9e44-a79761fc7387", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	40	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3hxVOwfTY5vu	canceled	t	2026-06-03 11:55:51.025+05:30	2026-06-03 12:07:13.546+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:25:51.025Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:13.546Z"}]	\N	\N	\N	\N	\N	\N	f	\N
b9de03e9-5563-433f-a1c8-0663ad9b8009	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	5416585a-3483-4e49-b83e-4e602613ad42	75f52ffe-d4e4-4887-9708-c4494df43d21	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop", "name": "Fresh Mysore Beetroot (1kg)", "sgst": 0, "price": 60, "total": 60, "quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	60	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3F6dXMGXPPuG	canceled	t	2026-06-03 11:28:32.04+05:30	2026-06-03 12:07:10.837+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T05:58:32.039Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:10.837Z"}]	\N	\N	\N	\N	\N	\N	f	\N
b56b0128-441d-4ae3-8910-6fd6ced800fe	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5ca00746-f667-4dad-bcca-0b7af2be6e2b	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 270, "total": 270, "quantity": 3, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}, {"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	300	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-06-01 12:51:12.215+05:30	2026-06-01 19:43:48.585+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T07:21:12.215Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T07:21:22.581Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-06-01T07:21:24.714Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T07:21:27.535Z"}]	2026-06-01 12:51:22.581+05:30	\N	2026-06-01 12:51:24.714+05:30	2026-06-01 12:51:27.535+05:30	Masala dosa is amazing - you people should try this	\N	t	\N
4185d1b3-cc28-4ab3-8da6-e0a70c00cd89	\N	0893032b-3193-47b5-a046-c0f762670f46	bc349e5f-11a0-4020-9150-841d9ce04680	768744ff-8ce1-43d8-ab3b-dbc3e3684478	249b4a73-3581-4db5-8c9e-d259c38acdc8	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop", "name": "Fresh Potato (1kg)", "sgst": 0, "price": 40, "total": 40, "quantity": 1, "productId": "42fcd02e-c546-40a3-b4d0-c37212001b1d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	40	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-24 21:00:51.023+05:30	2026-06-01 19:46:58.604+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-24T15:30:55.636Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-24T15:31:03.050Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-24T15:31:05.759Z"}]	2026-05-24 21:00:55.636+05:30	\N	2026-05-24 21:01:03.05+05:30	2026-05-24 21:01:05.759+05:30	purchased it for my son	\N	t	\N
fc4b49c8-80d3-4982-84bb-a18c19e380bc	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	b4feb77b-bd50-44c7-9041-8d1e80111ebf	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-06-01 14:25:06.346+05:30	2026-06-01 19:43:46.917+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T08:55:06.346Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T08:55:11.182Z"}]	\N	\N	\N	2026-06-01 14:25:11.182+05:30	the filter coffee is a must try in this hotel	\N	t	\N
a00440ba-825d-4d84-a0bc-ea94e23f4b1d	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	fbf8a7f5-f34a-44d1-a965-ae8ccb130af2	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop", "name": "Margherita Pizza", "sgst": 0, "price": 349, "total": 349, "quantity": 1, "productId": "prod_2056c34994815b36", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Pizza", "customizationDetails": []}]	0	349	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-22 23:13:27.181+05:30	2026-06-01 19:47:40.535+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-22T17:43:37.540Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-22T17:44:02.890Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-22T17:44:11.534Z"}]	2026-05-22 23:13:37.54+05:30	\N	2026-05-22 23:14:02.89+05:30	2026-05-22 23:14:11.534+05:30	\N	\N	t	\N
21e276e6-c7b3-4047-b260-e667ca0e963e	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	cb68f578-8254-42f2-a00c-eb80a1136508	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-06-01 15:11:57.97+05:30	2026-06-01 20:06:51.609+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T09:41:57.970Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T09:42:04.949Z"}]	\N	\N	\N	2026-06-01 15:12:04.949+05:30	masala dosa is amazing - pelase try it with the coffee	\N	t	\N
3213107d-5665-40e1-95da-26a57d8dc73e	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	77a25285-40ba-4af1-9ee6-29e4e0a19d1d	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Premium Degree Filter Coffee", "sgst": 0, "price": 40, "total": 40, "quantity": 1, "productId": "30fd9c4e-4e01-4536-9e44-a79761fc7387", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	40	0	New order from mobile app	"Delivery"	pending	cod	\N	canceled	t	2026-06-01 20:28:56.628+05:30	2026-06-01 20:39:50.821+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T09:41:38.787Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-01T15:05:01.876Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-01T15:07:31.151Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-01T15:07:44.850Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-01T15:09:50.821Z"}]	\N	\N	\N	\N	\N	\N	f	\N
a5b71bd6-761c-420b-8d58-fa088bcc542f	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	e0431e6c-04f2-4e5f-ad85-bdb006744eff	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-06-01 17:28:43.151+05:30	2026-06-01 20:06:50.977+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T11:58:43.151Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T11:58:48.214Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T11:58:51.907Z"}]	2026-06-01 17:28:48.214+05:30	\N	\N	2026-06-01 17:28:51.907+05:30	the coffeed is amzing - you should try this.	\N	t	\N
353dfafd-8463-4c4c-9272-1ac397bbed95	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	34bf44f3-2ea6-40ae-91e2-a940e384b224	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx4PLWMDnU9Bmi	delivered	t	2026-06-03 12:36:55.414+05:30	2026-06-03 12:38:59.552+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T07:06:55.413Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T07:08:21.628Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:24.716Z"}]	2026-06-03 12:38:21.628+05:30	\N	\N	2026-06-03 12:38:24.716+05:30	\N	\N	t	\N
a22760e7-5cb3-495d-99f5-8636b61ac2e8	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	6d1cf02c-9061-4831-94ec-d7944f4bc5bd	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3rpzMqXCCBbg	delivered	t	2026-06-03 12:05:12.161+05:30	2026-06-03 12:39:02.59+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:35:12.161Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T06:35:53.664Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:37.503Z"}]	2026-06-03 12:05:53.664+05:30	\N	\N	2026-06-03 12:38:37.503+05:30	\N	\N	t	\N
332f7205-9324-457e-9237-77e29e71d35a	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	526990fb-2c12-47fd-84f0-7d8d5d253052	75f52ffe-d4e4-4887-9708-c4494df43d21	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop", "name": "Fresh Mysore Beetroot (1kg)", "sgst": 0, "price": 60, "total": 60, "quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	60	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3HRE7cjuuwAf	canceled	t	2026-06-03 11:30:44.739+05:30	2026-06-03 12:07:17.704+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:00:44.738Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:17.704Z"}]	\N	\N	\N	\N	\N	\N	f	\N
b7af27ef-835f-4474-8cb3-c0429e49f316	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	46903967-4f4d-451b-96c9-8a286c0081c6	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	pending	razorpay	order_SwkT4McTIX129L	canceled	t	2026-06-02 17:06:34.394+05:30	2026-06-03 12:07:23.49+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-02T11:36:34.394Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:23.490Z"}]	\N	\N	\N	\N	\N	\N	f	\N
0c8a2a20-291b-43f1-b7f6-4794cd5790c4	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	06aa2ee2-1bed-4fda-9198-285b138dae66	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Kesari Bath", "sgst": 0, "price": 250, "total": 250, "quantity": 5, "productId": "c74aed60-fe9b-4db2-94cb-63f86f6fed98", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	250	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-06-01 16:58:04.335+05:30	2026-06-01 19:43:43.131+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T11:28:04.335Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T11:28:11.223Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-06-01T11:28:15.100Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T11:28:16.766Z"}]	2026-06-01 16:58:11.223+05:30	\N	2026-06-01 16:58:15.1+05:30	2026-06-01 16:58:16.766+05:30	kesaribath was amzing- people should try it	\N	t	\N
ece64cef-d7a7-4acc-b5e9-c7516a1b13ff	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	1a6bc7af-0c3a-48c6-966d-57e13b4adc2d	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	cod	\N	delivered	t	2026-05-30 09:55:21.111+05:30	2026-06-01 19:43:49.58+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-05-30T04:25:21.111Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-30T04:25:34.347Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-30T04:25:48.790Z"}]	2026-05-30 09:55:34.347+05:30	\N	\N	2026-05-30 09:55:48.79+05:30	\N	\N	t	\N
ba42d130-b7aa-4ac3-83ec-264cc5058276	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	a6e64cde-3ac3-4359-a793-f46eec5226d4	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	30	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-05-27 17:24:49.479+05:30	2026-06-01 19:43:53.124+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-27T11:55:01.680Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-27T11:55:17.490Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-27T11:55:20.151Z"}]	2026-05-27 17:25:01.68+05:30	\N	2026-05-27 17:25:17.49+05:30	2026-05-27 17:25:20.151+05:30	\N	\N	t	\N
3336bcf3-3003-4e57-ab26-b5630e7a06cf	\N	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	416b2dbe-9493-4c55-8428-39c43e3e0b64	75f52ffe-d4e4-4887-9708-c4494df43d21	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop", "name": "Fresh Mysore Beetroot (1kg)", "sgst": 0, "price": 60, "total": 60, "quantity": 1, "productId": "435189a8-d3fc-448f-a28f-4a7290d10583", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	60	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3IDjcH11Abp4	canceled	t	2026-06-03 11:31:29.212+05:30	2026-06-03 12:07:15.569+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:01:29.212Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:15.569Z"}]	\N	\N	\N	\N	\N	\N	f	\N
9a632145-2c9a-44ac-a732-c95e9375214e	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	c7af8c1d-3c84-4b06-ada6-4a157e2aa19b	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3uXKGjOvz2DP	delivered	t	2026-06-03 12:07:45.527+05:30	2026-06-03 12:39:01.832+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:37:45.527Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T06:38:17.647Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:32.821Z"}]	2026-06-03 12:08:17.647+05:30	\N	\N	2026-06-03 12:38:32.821+05:30	\N	\N	t	\N
92a58d4c-9b7e-4c42-a82b-04d963b95537	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	cbeea06d-bbc2-4a8e-a8be-6a42c0641851	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	pending	razorpay	order_SwkVEN0GM0xCId	canceled	t	2026-06-02 17:08:37.358+05:30	2026-06-03 12:07:07.76+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-02T11:38:37.358Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:07.760Z"}]	\N	\N	\N	\N	\N	\N	f	\N
6e39d440-64a5-4c4f-9595-7962b1ddd1aa	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	32fb24fc-7a85-4329-a5e8-f7ecce89cb14	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-06-01 20:28:16.343+05:30	2026-06-01 20:30:02.279+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T14:58:16.343Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T14:58:25.265Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-06-01T14:59:41.878Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-06-01T14:59:43.724Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T14:59:46.970Z"}]	2026-06-01 20:28:25.265+05:30	2026-06-01 20:29:41.878+05:30	2026-06-01 20:29:43.724+05:30	2026-06-01 20:29:46.97+05:30	\N	\N	t	\N
b26097af-49ac-4611-ad84-8447914650a1	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	b0e05491-c9be-49d6-a1e1-17a240bf01ae	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-06-01 20:40:02.424+05:30	2026-06-01 20:41:20.103+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T15:10:02.424Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T15:10:10.810Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-06-01T15:10:48.626Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-06-01T15:10:50.510Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T15:10:52.373Z"}]	2026-06-01 20:40:10.81+05:30	2026-06-01 20:40:48.626+05:30	2026-06-01 20:40:50.51+05:30	2026-06-01 20:40:52.373+05:30	\N	\N	t	\N
30226531-eee4-445a-a28d-8d5df7657648	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	98479d58-2d8a-4653-89a3-c0103551df8e	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	pending	cod	\N	canceled	t	2026-06-02 16:44:51.145+05:30	2026-06-02 17:01:01.577+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-02T11:14:51.145Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-02T11:31:01.573Z"}]	\N	\N	\N	\N	\N	\N	f	\N
9505b6b0-665f-4b8b-b6b5-263a29a42a02	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	e8e08fe4-18af-4228-91bf-77c9453cd7d8	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-06-02 10:59:50.268+05:30	2026-06-02 11:00:39.248+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-02T05:29:50.267Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-02T05:29:54.993Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-06-02T05:30:03.379Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-06-02T05:30:07.147Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-02T05:30:09.259Z"}]	2026-06-02 10:59:54.993+05:30	2026-06-02 11:00:03.379+05:30	2026-06-02 11:00:07.147+05:30	2026-06-02 11:00:09.259+05:30	\N	\N	t	\N
bb455048-19b6-4cda-8077-b0a6b9421f54	\N	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	8355e714-9510-4885-9a9a-ff9fc740377b	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	upi	\N	delivered	t	2026-06-01 20:49:08.616+05:30	2026-06-01 20:49:36.086+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-01T15:19:08.615Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-01T15:19:17.306Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-01T15:19:19.422Z"}]	2026-06-01 20:49:17.306+05:30	\N	\N	2026-06-01 20:49:19.422+05:30	\N	\N	t	\N
b888a6a4-d802-449f-87a6-3ff0cb33fb70	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	aedc724b-a9f6-4608-b945-74c25a10427f	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop", "name": "Authentic Mysore Masala Dosa", "sgst": 0, "price": 90, "total": 90, "quantity": 1, "productId": "c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	110	0	New order from mobile app	"Delivery"	pending	razorpay	order_MOCK_1780400024771	canceled	t	2026-06-02 17:03:44.769+05:30	2026-06-03 12:07:25.432+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-02T11:33:44.769Z"}, {"status": "canceled", "message": "Order canceled", "timestamp": "2026-06-03T06:37:25.432Z"}]	\N	\N	\N	\N	\N	\N	f	\N
a0dccc6f-1d1d-4761-9624-45cd0964ba4d	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	1ff268eb-122f-4999-9b49-2e4b2962098b	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3xQbLy7UMysT	delivered	t	2026-06-03 12:10:29.698+05:30	2026-06-03 12:39:00.922+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:40:29.698Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T06:40:57.037Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:27.488Z"}]	2026-06-03 12:10:57.037+05:30	\N	\N	2026-06-03 12:38:27.488+05:30	\N	\N	t	\N
f449f7d9-0a53-4133-872c-e965a43ea019	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	39b31098-df04-4ea3-bf01-93efa5c01ade	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3oWGmfVEfJPh	delivered	t	2026-06-03 12:02:03.731+05:30	2026-06-03 12:39:03.3+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:32:03.731Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T06:36:59.788Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:41.297Z"}]	2026-06-03 12:06:59.788+05:30	\N	\N	2026-06-03 12:38:41.297+05:30	\N	\N	t	\N
dd8f7d04-017d-4f8d-8295-bbda4e05d747	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	38d3848c-ed3b-4272-9724-f42d0769564f	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx3kj1nRL8FHiP	delivered	t	2026-06-03 11:58:25.137+05:30	2026-06-03 12:39:04.01+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T06:28:25.137Z"}, {"status": "accepted", "message": "Order accepted", "timestamp": "2026-06-03T06:37:01.902Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:08:46.021Z"}]	2026-06-03 12:07:01.902+05:30	\N	\N	2026-06-03 12:38:46.021+05:30	\N	\N	t	\N
b33b4510-b7bb-4116-b841-6f0140fc0be2	\N	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	62e65bc1-7b40-495c-8d1a-037f750a0020	9e788bd7-04ac-4154-af16-cb086c59b39b	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop", "name": "Mysore Special Filter Coffee", "sgst": 0, "price": 30, "total": 30, "quantity": 1, "productId": "e5fe1624-257e-47d0-aa61-8974d9e2576d", "otherTaxes": 0, "specialRequest": "", "product_catagory": null, "customizationDetails": []}]	0	50	0	New order from mobile app	"Delivery"	paid	razorpay	order_Sx4Rs6EwqkYYSP	delivered	t	2026-06-03 12:39:16.785+05:30	2026-06-03 12:40:26.358+05:30	[{"status": "waiting", "message": "Order placed", "timestamp": "2026-06-03T07:09:16.785Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-06-03T07:09:45.203Z"}]	\N	\N	\N	2026-06-03 12:39:45.203+05:30	\N	\N	t	\N
\.


--
-- Data for Name: PhoneBookGroupRelations; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."PhoneBookGroupRelations" (id, "phoneBookId", "groupId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PhoneBookGroups; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."PhoneBookGroups" (id, "groupName", uuid, "integrationId", "createdAt", "updatedAt") FROM stdin;
dd39c413-e71b-4f1a-bc21-795773ad1c88	Test Group	pbg-uuid-55555	09dacbba-d0e7-4862-8a77-e8bded1ea387	2026-05-22 21:25:36.215+05:30	2026-05-22 21:25:36.215+05:30
\.


--
-- Data for Name: PhoneBooks; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."PhoneBooks" (id, "integrationId", "userId", uuid, "createdAt", "updatedAt") FROM stdin;
61886a41-8dfe-4626-a469-8909516ab5b2	908fa830-7d67-4555-8d3b-a72b20636d44	0893032b-3193-47b5-a046-c0f762670f46	b96a8ddf-1274-44da-b19c-1a8faa02cb87	2026-05-11 12:29:29.456+05:30	2026-05-11 12:29:29.456+05:30
10a5610c-68df-472f-96c8-e38cf0d3e09c	908fa830-7d67-4555-8d3b-a72b20636d44	e4791d20-e5a6-4f07-87c8-8989898989ab	6383c67d-af84-4cea-8c64-6f514cc66c0b	2026-05-11 12:44:22.179+05:30	2026-05-11 12:44:22.179+05:30
2844b5d9-25ff-4fce-b95b-c60527ee3143	276a3e39-06aa-46ab-b73b-774f8192fb11	0893032b-3193-47b5-a046-c0f762670f46	46ada3f7-9675-4882-9bee-3893168294e8	2026-05-16 18:33:58.579+05:30	2026-05-16 18:33:58.579+05:30
fea6282a-9fa6-495b-acc9-bd46e3be46ba	0bfbb67d-2547-4106-a876-ad0db8a8af88	0893032b-3193-47b5-a046-c0f762670f46	20d353db-2f0b-45c9-b88c-f3b9788e86fc	2026-05-18 11:47:29.829+05:30	2026-05-18 11:47:29.829+05:30
e3429288-dbad-4413-b2ad-3c991f91713c	1495f4e0-101d-468a-b2a7-a71ff514d7a2	0893032b-3193-47b5-a046-c0f762670f46	d00dcfff-f4db-4243-bff8-01fe3021a6cf	2026-05-18 11:47:36.719+05:30	2026-05-18 11:47:36.719+05:30
c680b945-cc96-4004-9658-b7babe98f775	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	0893032b-3193-47b5-a046-c0f762670f46	1ec79f88-cd32-4746-a533-61040822004b	2026-05-18 11:47:42.239+05:30	2026-05-18 11:47:42.239+05:30
b61fcf1a-4d5b-4ae9-a71d-cd282991b19a	09dacbba-d0e7-4862-8a77-e8bded1ea387	89ad3c81-22f9-4681-be33-63354f7d3e41	pb-uuid-55555	2026-05-22 21:25:28.607+05:30	2026-05-22 21:25:28.607+05:30
07d3f3c5-2db4-4c59-8176-0d33c5d3b4c5	bc349e5f-11a0-4020-9150-841d9ce04680	0893032b-3193-47b5-a046-c0f762670f46	8ea56736-2e46-4f2f-94a3-309a853f8ebc	2026-05-24 14:15:09.086+05:30	2026-05-24 14:15:09.086+05:30
6e576269-92b4-4f23-98a1-5bc189e7c9a6	1f6b2343-2619-429e-b843-dfda8ed66949	0893032b-3193-47b5-a046-c0f762670f46	d5eb4936-665c-4795-a14b-7a9fefcd7b21	2026-05-24 14:15:13.351+05:30	2026-05-24 14:15:13.351+05:30
1ab25323-e291-4547-b1b4-1c2be12113e3	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	0893032b-3193-47b5-a046-c0f762670f46	d1007161-93be-4021-8329-3d46ff35ca1b	2026-05-24 14:15:19.19+05:30	2026-05-24 14:15:19.19+05:30
6838bcbb-f873-4426-a0fc-3917a52ceab0	09dacbba-d0e7-4862-8a77-e8bded1ea387	d0b83594-f364-48c9-aed6-c1cb29c4223b	1ca79ebc-6528-4d28-8fb9-edf20d701268	2026-05-24 21:28:44.149+05:30	2026-05-24 21:28:44.149+05:30
c07efba7-521e-4f82-bc63-6800325118f0	b62f1b85-31fe-4065-a964-3ce587191c59	0893032b-3193-47b5-a046-c0f762670f46	a84dc7da-b97e-4771-beb1-010a19ad3d30	2026-05-26 13:13:16.96+05:30	2026-05-26 13:13:16.96+05:30
e58232f5-878d-4cea-926e-9a152e69ad31	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	0893032b-3193-47b5-a046-c0f762670f46	702136d6-9e27-4fac-831b-70e40d136c40	2026-05-26 13:30:30.876+05:30	2026-05-26 13:30:30.876+05:30
39479b06-5ff2-4b6b-8c4d-89757069e5aa	09dacbba-d0e7-4862-8a77-e8bded1ea387	0893032b-3193-47b5-a046-c0f762670f46	357fbd83-73b7-4b12-9c61-d99a019bc6e8	2026-05-26 14:05:05.437+05:30	2026-05-26 14:05:05.437+05:30
5ff24dcd-e3a0-4789-a6a9-137f0dcf1262	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	0893032b-3193-47b5-a046-c0f762670f46	dc56dd0d-73fc-443d-8cf4-0b2158051bbb	2026-05-26 14:45:21.477+05:30	2026-05-26 14:45:21.477+05:30
928dca53-110a-4735-b89a-efaa457ec71f	957480f9-becd-4755-82d1-182ebd9c01e7	0893032b-3193-47b5-a046-c0f762670f46	e71dbf29-dbbe-4522-b69f-104adbc0a29c	2026-05-26 14:45:26.74+05:30	2026-05-26 14:45:26.74+05:30
626c0f72-9202-4392-9a85-a4469af71b5c	494f78a4-8b1c-451f-af8f-c41995696ae1	0893032b-3193-47b5-a046-c0f762670f46	edfbdb2b-bf07-46e9-a29f-202f66f020f4	2026-05-26 14:45:33.427+05:30	2026-05-26 14:45:33.427+05:30
7d8fdb03-c252-4901-8e56-1ccd2421bdba	65bb875d-0496-4db0-b1fc-ea2fae0630c9	0893032b-3193-47b5-a046-c0f762670f46	4a7e666c-dee5-4237-9b58-37d914879411	2026-05-26 14:46:12.485+05:30	2026-05-26 14:46:12.485+05:30
01abfef3-5d33-418c-9726-55907953ae3f	3a1c4e22-c740-4ea2-8ace-4308de78605d	0893032b-3193-47b5-a046-c0f762670f46	96104c01-26f4-4451-88b5-955a95ddbc2a	2026-05-26 15:04:06.166+05:30	2026-05-26 15:04:06.166+05:30
d53da9a2-c67a-4253-8b10-74dbb3a174d1	19106bf7-bf42-41c0-910f-5ca7ab302313	0893032b-3193-47b5-a046-c0f762670f46	6bbf16da-85bc-4eec-979f-9a82d5556374	2026-05-26 15:04:09.543+05:30	2026-05-26 15:04:09.543+05:30
f00cf707-77e5-4428-a881-2898e34dd1ed	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	0893032b-3193-47b5-a046-c0f762670f46	db23f665-2ce5-4301-9ec0-6597b9a1410f	2026-05-27 09:33:28.877+05:30	2026-05-27 09:33:28.877+05:30
2b43dd41-0ed6-46bc-bb87-5a5fc689b645	908fa830-7d67-4555-8d3b-a72b20636d44	964c8fa7-d191-4ebc-adc8-9790b2b0197f	641e4aba-734a-4be3-993c-d40396e952fc	2026-05-27 10:11:02.396+05:30	2026-05-27 10:11:02.396+05:30
17577375-1e17-44b1-bd30-ce3bee462038	1f6b2343-2619-429e-b843-dfda8ed66949	4202016f-47fd-47e7-ace4-81c2be3d4ee6	3398986e-23e2-4de3-9661-da296fa68675	2026-05-27 13:33:53.439+05:30	2026-05-27 13:33:53.439+05:30
8e0bb6ad-9975-473e-b46f-c40df3803d5d	4056c17e-7978-40f9-a7cf-5254569ccbfb	0893032b-3193-47b5-a046-c0f762670f46	4a7ed5c5-ebf3-4d71-a054-0ab06c3e792e	2026-05-28 11:22:35.101+05:30	2026-05-28 11:22:35.101+05:30
a4450d4d-7fec-4ba1-9360-60e8dd34702f	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	4202016f-47fd-47e7-ace4-81c2be3d4ee6	de0edeee-fd23-4cfc-b8ed-0c0bb2b073c6	2026-06-01 15:11:15.602+05:30	2026-06-01 15:11:15.602+05:30
3e535afc-3e34-4033-a469-27368d95470e	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	4202016f-47fd-47e7-ace4-81c2be3d4ee6	f419570c-c6c8-4ae5-9753-0680609ed6c3	2026-06-01 23:42:20.71+05:30	2026-06-01 23:42:20.71+05:30
32034e58-d2b9-42f4-8428-108764e3c5a3	eda5847c-55a5-456a-a166-996a95a6be3a	0893032b-3193-47b5-a046-c0f762670f46	b9646890-a274-4ed9-9d53-f722a751b2ec	2026-06-02 20:36:58.328+05:30	2026-06-02 20:36:58.328+05:30
2da034a6-5770-49e0-87e5-c51fa099d5e1	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	0893032b-3193-47b5-a046-c0f762670f46	493a98f6-1f80-4502-9324-3a06066d3596	2026-06-02 20:37:33.386+05:30	2026-06-02 20:37:33.386+05:30
31de9a31-4775-4432-b3b2-9823efa73f33	2274fdcf-4283-4681-a87c-f56834b6f0c0	0893032b-3193-47b5-a046-c0f762670f46	128f741c-d65c-4adc-a2eb-82f930a17855	2026-06-03 11:53:18.54+05:30	2026-06-03 11:53:18.54+05:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Products" (id, "catalogueId", name, description, price, currency, "imageUrls", sku, quantity, "isActive", "isDeleted", "createdAt", "updatedAt", "discountPrice", category, subcategory, specifications, "integrationId", "dietaryType", "isBestseller", "preparationTime", "variantsConfig", "mongoId", "customizationId", "nutritionData") FROM stdin;
b3444754-349c-4b4f-bae1-d01964651791	f796d111-0ef3-4fb2-9f70-f5ab55407d03	Grilled Chicken Sandwich	Freshly grilled chicken loaded with cheese and mayo.	210	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	SDW-004	100	t	f	2026-05-19 22:22:35.248+05:30	2026-06-01 23:22:03.103+05:30	0	Sandwich	\N	{"foodType": "Non Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
871e3769-9e31-49f4-82e0-9441df333be5	f796d111-0ef3-4fb2-9f70-f5ab55407d03	Classic Veg Burger	Tasty veggie burger with lettuce and special sauce.	159	INR	["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"]	BRG-001	92	t	f	2026-05-19 22:22:35.238+05:30	2026-05-19 22:22:35.238+05:30	0	Burgers	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
prod_66dcb738fcdf783b	cat_99cca0524609a55e	Mango Smoothie	Thick blended mango smoothie with milk and ice cream.	149	INR	["https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop"]	BV-103	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Smoothies	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
prod_8cfa157b84d40b72	cat_99cca0524609a55e	Virgin Mojito	Refreshing mint and lime drink.	129	INR	["https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop"]	BV-104	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Mocktails	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
prod_a293b7a4a8b5cd2c	cat_99cca0524609a55e	Coca Cola 500ml	Regular Coke bottle chilled.	45	INR	["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop"]	BV-105	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Soft Drinks	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
9ae4bd07-4ae1-4e95-8e12-bdc60d11d766	f796d111-0ef3-4fb2-9f70-f5ab55407d03	Margherita Pizza	Double cheese loaded freshly baked pizza.	349	INR	["https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop"]	PZA-002	99	t	f	2026-05-19 22:22:35.244+05:30	2026-05-19 22:22:35.244+05:30	0	Pizza	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
091d7553-839a-4f64-90c1-60d695bb6f79	f796d111-0ef3-4fb2-9f70-f5ab55407d03	Peri Peri Fries	Crispy golden fries dusted with spicy peri peri powder.	99	INR	["https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop"]	SD-003	100	t	f	2026-05-19 22:22:35.247+05:30	2026-05-19 22:22:35.247+05:30	0	Sides	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	non-veg	t	15	[]	\N	\N	{}
4a2b5738-6a40-43e0-b849-a8ba3f981642	05ed8c8c-728f-4d41-8f33-17db52c559af	Fresh Lime Soda	Chilled lime soda with salt or sugar.	79	INR	["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"]	BV-101	250	t	f	2026-05-19 22:22:35.254+05:30	2026-05-19 22:22:35.254+05:30	0	Mocktails	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
prod_2056c34994815b36	cat_8bd8822dbd89da8f	Margherita Pizza	Double cheese loaded freshly baked pizza.	349	INR	["https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop"]	PZA-002	97	t	f	2026-05-10 15:16:45.939+05:30	2026-05-22 23:21:16.616+05:30	0	Pizza	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
prod_393f23f975b22326	cat_8bd8822dbd89da8f	Peri Peri Fries	Crispy golden fries dusted with spicy peri peri powder.	99	INR	["https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop"]	SD-003	100	t	f	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	0	Sides	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	non-veg	t	15	[]	\N	\N	{}
prod_39151eafa772e0cc	cat_8bd8822dbd89da8f	Choco Lava Cake	Molten hot chocolate filling inside gooey cake.	120	INR	["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"]	DST-005	100	t	f	2026-05-10 15:16:45.939+05:30	2026-06-01 23:22:03.11+05:30	0	Desserts	\N	{"foodType": "Egg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
prod_b30cb253310703e8	cat_99cca0524609a55e	Iced Caramel Macchiato	Rich espresso with caramel drizzle served over ice.	189	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	BV-102	250	t	f	2026-05-10 15:21:09.531+05:30	2026-06-01 23:22:03.111+05:30	0	Coffee	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
prod_8c85e274fc17b846	cat_99cca0524609a55e	Fresh Lime Soda	Chilled lime soda with salt or sugar.	79	INR	["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"]	BV-101	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Mocktails	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
e2650265-6b64-4924-b78e-0b133dcffb25	f796d111-0ef3-4fb2-9f70-f5ab55407d03	Choco Lava Cake	Molten hot chocolate filling inside gooey cake.	120	INR	["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"]	DST-005	100	t	f	2026-05-19 22:22:35.249+05:30	2026-06-01 23:22:03.112+05:30	0	Desserts	\N	{"foodType": "Egg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
266d7112-3002-4eaf-adee-d4b05fe907a7	05ed8c8c-728f-4d41-8f33-17db52c559af	Mango Smoothie	Thick blended mango smoothie with milk and ice cream.	149	INR	["https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop"]	BV-103	250	t	f	2026-05-19 22:22:35.251+05:30	2026-05-19 22:22:35.251+05:30	0	Smoothies	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
bed2382a-673c-4328-89ab-6e92aae058bd	05ed8c8c-728f-4d41-8f33-17db52c559af	Virgin Mojito	Refreshing mint and lime drink.	129	INR	["https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop"]	BV-104	250	t	f	2026-05-19 22:22:35.252+05:30	2026-05-19 22:22:35.252+05:30	0	Mocktails	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
e73890da-fb58-4be0-ba51-2fcb1c608c63	05ed8c8c-728f-4d41-8f33-17db52c559af	Coca Cola 500ml	Regular Coke bottle chilled.	45	INR	["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop"]	BV-105	250	t	f	2026-05-19 22:22:35.253+05:30	2026-05-19 22:22:35.253+05:30	0	Soft Drinks	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
bc7fc3e5-e003-4f87-9ea4-16df5d7a8a4a	05ed8c8c-728f-4d41-8f33-17db52c559af	Iced Caramel Macchiato	Rich espresso with caramel drizzle served over ice.	189	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	BV-102	250	t	f	2026-05-19 22:22:35.256+05:30	2026-06-01 23:22:03.112+05:30	0	Coffee	\N	{"foodType": "Veg"}	f1665785-dab5-4a4b-a543-109b62e9af4a	veg	f	15	[]	\N	\N	{}
prod_c8769bce45cfe3d3	cat_8bd8822dbd89da8f	Classic Veg Burger	Tasty veggie burger with lettuce and special sauce.	159	INR	["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"]	BRG-001	91	t	f	2026-05-10 15:16:45.939+05:30	2026-05-22 22:54:15.147+05:30	0	Burgers	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
e5fe1624-257e-47d0-aa61-8974d9e2576d	9e788bd7-04ac-4154-af16-cb086c59b39b	Mysore Special Filter Coffee	Rich, hot filter coffee brewed with fresh chicory blend.	30	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	MRK-COF-001	82	t	f	2026-05-26 13:58:14.259+05:30	2026-06-02 17:01:01.573+05:30	29	\N	\N	{"unit": "Pc"}	1f6b2343-2619-429e-b843-dfda8ed66949	veg	f	15	[]	\N	\N	{}
a74f3bcd-8eed-4271-94e7-ed0ff7807f36	9e788bd7-04ac-4154-af16-cb086c59b39b	Dosa	Ghee pudi masala Dosa	75	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	100	98	t	f	2026-05-27 09:37:49.644+05:30	2026-06-01 23:22:03.113+05:30	75	Food		{"cgst": "0", "sgst": "0", "foodType": "", "otherTaxes": "0"}	1f6b2343-2619-429e-b843-dfda8ed66949	veg	f	15	[]	\N	\N	{}
445cd2dc-ab20-4d9e-aaf9-322dfe87b53e	88069782-38a4-497d-9cd9-86b4114f43cb	Mysore Masala Dosa	Crispy rice crepe smeared with hot garlic chutney, stuffed with mashed potato and served with sambar and coconut chutney.	90	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-1-267	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	86	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
505b5bc2-bce1-44e2-9323-a9f7a9b8e2a8	88069782-38a4-497d-9cd9-86b4114f43cb	Steaming Idli Sambar (2 Pcs)	Soft and fluffy steamed rice cakes served with hot lentil sambar and fresh coconut chutney.	45	INR	["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-2-685	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	43	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
5d6ce6e5-3208-44b6-8ae6-735c6470f54c	88069782-38a4-497d-9cd9-86b4114f43cb	Crispy Medu Vada (2 Pcs)	Golden brown, donut-shaped crispy lentil fritters spiced with ginger and black pepper.	50	INR	["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-3-681	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	48	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
c6e14342-773e-48d8-88cf-5ca1c8905696	88069782-38a4-497d-9cd9-86b4114f43cb	Rava Khara Bath	Traditional savory semolina pudding cooked with ghee, mixed vegetables, curry leaves, and mustard seeds.	55	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-4-777	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	52	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
5ca06bc0-ea0f-49ab-9eff-6769a9952df8	88069782-38a4-497d-9cd9-86b4114f43cb	Sweet Kesari Bath	Delectable sweet semolina pudding flavored with saffron, ghee, and loaded with cashew nuts and raisins.	50	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-5-834	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.115+05:30	48	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
1124375a-c8b4-4494-aeb5-503bcd9f6a5d	88069782-38a4-497d-9cd9-86b4114f43cb	Poori Sagu (3 Pcs)	Puffed, deep-fried wheat breads served with a delicious potato and mixed vegetable gravy.	75	INR	["https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-6-504	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	71	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
6493bb9e-4beb-4361-9b74-c9e6b90eb810	88069782-38a4-497d-9cd9-86b4114f43cb	Premium Degree Filter Coffee	Authentic South Indian chicory blend coffee brewed in brass filters and served frothy with hot milk.	35	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-7-137	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	33	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
6ba68641-bddc-4029-b078-4153f54ec81b	88069782-38a4-497d-9cd9-86b4114f43cb	Gobi Manchurian Dry	Crispy fried cauliflower florets tossed in a sweet, spicy, and tangy Indo-Chinese sauce.	120	INR	["https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-11-226	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	114	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
5627e30a-e8d6-4214-8161-cedb3aa288a9	88069782-38a4-497d-9cd9-86b4114f43cb	Mango Lassi	Creamy, sweet yogurt drink blended with ripe Alphonso mango pulp.	70	INR	["https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-13-935	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	67	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
c88049c5-c985-44cd-b33f-afea838a74a7	88069782-38a4-497d-9cd9-86b4114f43cb	Fresh Lime Mint Juice	Refreshing cold beverage made from freshly squeezed limes, crushed mint, and ice.	45	INR	["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-14-698	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	43	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
adef5157-2fde-4834-a696-deee09e9bd2d	88069782-38a4-497d-9cd9-86b4114f43cb	Chola Bhatura Platter	Large fluffy fried leavened bread served with spicy, tangy chickpea curry and pickle.	140	INR	["https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-18-176	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	133	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
6a8cceba-54ee-44e8-8646-f50f2ea1bcad	88069782-38a4-497d-9cd9-86b4114f43cb	Onion Uttapam	Thick, savory rice crepe topped with finely chopped red onions, green chillies, and fresh coriander.	85	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-19-440	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	81	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
prod_8c0e42a6419dcdf6	cat_8bd8822dbd89da8f	Grilled Chicken Sandwich	Freshly grilled chicken loaded with cheese and mayo.	210	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	SDW-004	98	t	f	2026-05-10 15:16:45.939+05:30	2026-06-01 23:22:03.114+05:30	0	Sandwich	\N	{"foodType": "Non Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N	{}
ef186103-b6b6-4459-8c29-d7a36618d320	88069782-38a4-497d-9cd9-86b4114f43cb	Paneer Butter Masala	Soft cottage cheese cubes simmered in a rich, buttery, and creamy tomato gravy.	180	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-8-462	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.116+05:30	171	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
829fa191-e63a-4a26-a9d9-2f85ed6e919a	88069782-38a4-497d-9cd9-86b4114f43cb	Butter Naan (1 Pc)	Soft, leavened clay-oven flatbread brushed with abundant melted butter.	40	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-9-198	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.116+05:30	38	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
5d1022ff-f875-460d-a4dd-a57245519d79	88069782-38a4-497d-9cd9-86b4114f43cb	Veg Donne Biryani	Aromatic Jeera Samba rice cooked with fresh mint, coriander, whole spices, and vegetable chunks, served in a leaf cup.	160	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-10-938	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.117+05:30	152	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
fb7ed3bf-cf05-475a-88c9-ca82f50da096	88069782-38a4-497d-9cd9-86b4114f43cb	Veg Fried Rice	Fragrant basmati rice stir-fried in a wok with fresh spring onions, carrots, beans, and light soy sauce.	130	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-12-375	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.117+05:30	124	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
5f1d69c6-ea66-4d8e-a252-77855039535e	88069782-38a4-497d-9cd9-86b4114f43cb	Hot Badam Milk	Warm milk flavored with saffron, cardamom, and almond paste, topped with almond flakes.	50	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-15-726	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.117+05:30	48	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
636eba1b-68de-4479-bdfb-922d10672796	88069782-38a4-497d-9cd9-86b4114f43cb	Gulab Jamun (2 Pcs)	Deep-fried milk dumplings soaked in a warm, sweet cardamom-infused sugar syrup.	60	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-16-538	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.118+05:30	57	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
8eaf1c2f-f5ff-4165-9299-3522752a3dc4	88069782-38a4-497d-9cd9-86b4114f43cb	Traditional Mysore Pak	Rich and crumbly premium sweet made from pure ghee, gram flour, and sugar.	80	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-17-101	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.118+05:30	76	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
b93190b4-8be5-49d0-b98b-e9963025cd0e	88069782-38a4-497d-9cd9-86b4114f43cb	Vegetable Pulav	Fragrant one-pot rice dish loaded with seasonal vegetables and mild Indian spices.	120	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-20-374	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.119+05:30	114	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
d6f53807-5805-444a-ad38-9f18b3487096	88069782-38a4-497d-9cd9-86b4114f43cb	Mini South Indian Thali	Rice, Sambar, Rasam, one dry vegetable curry, curd, papad, and a sweet.	150	INR	["https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-23-189	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	143	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
221293e5-dfd7-4141-8d67-888cf014d2dc	88069782-38a4-497d-9cd9-86b4114f43cb	Sizzling Brownie with Ice Cream	Fudgy warm chocolate brownie served on a hot sizzler plate with vanilla ice cream and chocolate syrup.	160	INR	["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-24-298	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	152	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
6794a31a-eb4a-43ef-9640-9a93a18ac666	88069782-38a4-497d-9cd9-86b4114f43cb	Cold Badam Kulfi	Creamy, slow-churned Indian frozen dessert flavored with saffron and almonds.	65	INR	["https://images.unsplash.com/photo-1579631542720-3a87824ffd8e?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-25-169	100	t	f	2026-05-24 14:37:32.519+05:30	2026-05-24 14:37:32.519+05:30	62	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
e8066e24-4310-4769-b288-2e5f91cc8357	d546fa92-ccde-4634-bae2-ed2faa473ac7	Organic Red Tomato (1kg)	Fresh, juicy, and pesticide-free tomatoes sourced directly from local farms.	60	INR	["https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-1-953	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	57	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
0a099a6a-de82-44c2-90d1-df159b668125	d546fa92-ccde-4634-bae2-ed2faa473ac7	Fresh Potato (1kg)	Premium quality farm potatoes, ideal for roasting, baking, or boiling.	40	INR	["https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-2-397	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	38	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
a216354f-fb9e-42aa-9d49-41b3266bea3d	d546fa92-ccde-4634-bae2-ed2faa473ac7	Local Red Onion (1kg)	Crisp, pungent red onions, an essential base for all Indian cooking.	45	INR	["https://images.unsplash.com/photo-1508747703725-719ae2c73ee1?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-3-439	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	43	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
ae23aadc-fd6e-4778-a0d3-9aef07e45ac7	d546fa92-ccde-4634-bae2-ed2faa473ac7	Nanjangud Bananas (1 Dozen)	Geographical Indication (GI) tagged sweet local bananas from Mysore region.	80	INR	["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-4-227	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	76	\N	\N	{"unit": "Pc"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
781df4a3-9f51-4997-9a77-e695c039220c	d546fa92-ccde-4634-bae2-ed2faa473ac7	Fresh Royal Gala Apple (1kg)	Sweet, crisp, and nutrient-rich imported red apples.	180	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-5-538	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	171	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
08b0c21e-4b56-41fd-aa8c-e30c21b3b38d	d546fa92-ccde-4634-bae2-ed2faa473ac7	Coorg Honey Orange (1kg)	Juicy, sweet and slightly tangy premium local oranges from Coorg hills.	120	INR	["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-6-986	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	114	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
5c1de9ce-98f6-4cc5-a214-4c48bf6123da	d546fa92-ccde-4634-bae2-ed2faa473ac7	Green Seedless Grapes (500g)	Sweet and refreshing seedless green grapes, cleaned and packed.	70	INR	["https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-7-947	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	67	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
2d256ab3-d76b-47e0-ab6f-d8992fd840bb	d546fa92-ccde-4634-bae2-ed2faa473ac7	Premium Unpolished Toor Dal (1kg)	High protein yellow split pigeon peas, free from polishing or additives.	160	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-8-771	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	152	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
0d0bcd1a-3a3a-4e46-aa31-5963ac47b1be	d546fa92-ccde-4634-bae2-ed2faa473ac7	Organic Moong Dal (1kg)	Light and nutritious split yellow moong lentils, organic certified.	140	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-9-517	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	133	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
9b62a84d-3a58-424e-9a0b-31d9cd6bafba	d546fa92-ccde-4634-bae2-ed2faa473ac7	Aged Sona Masuri Rice (5kg)	Premium aged local rice, cooks fluffy and lightweight.	340	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-10-994	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	323	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
72ba7f5e-bd5f-430c-afb5-4d8d83458398	d546fa92-ccde-4634-bae2-ed2faa473ac7	Wood-Pressed Coconut Oil (1L)	Cold pressed from sun-dried copra, retain natural aroma and nutrients.	280	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-11-109	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	266	\N	\N	{"unit": "L"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
a049ddfb-5ca0-4818-a254-052aaa22b098	d546fa92-ccde-4634-bae2-ed2faa473ac7	Pure Cow Ghee (500ml)	Aromatic, grainy-textured pure cow ghee prepared in traditional style.	360	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-12-755	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	342	\N	\N	{"unit": "L"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
a226c027-0bb1-4af8-a5d7-65ad3a665d45	d546fa92-ccde-4634-bae2-ed2faa473ac7	Nandini Toned Milk (1L)	Pasteurized toned milk, rich in calcium and vitamins, from KMF.	54	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-13-582	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	51	\N	\N	{"unit": "L"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
11b9fe1e-a677-4a53-84c4-f6426f5c258e	88069782-38a4-497d-9cd9-86b4114f43cb	Jeera Rice	Basmati rice cooked with clarified butter ghee and roasted cumin seeds.	90	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-22-870	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.122+05:30	86	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
30fd9c4e-4e01-4536-9e44-a79761fc7387	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	Premium Degree Filter Coffee	Brewed with high-grade Peaberry and chicory blend.	40	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	MFH-COF-01	103	t	f	2026-05-26 13:58:14.433+05:30	2026-06-01 20:39:50.821+05:30	38	\N	\N	{"unit": "Pc"}	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	veg	f	15	[]	\N	\N	{}
2fe2b73e-ce2d-455e-8497-8aad595c3e5f	d546fa92-ccde-4634-bae2-ed2faa473ac7	Organic Thick Curd (500g)	Thick, creamy set yogurt made from pure whole milk.	40	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-15-694	100	t	f	2026-05-24 14:37:32.525+05:30	2026-06-01 23:22:03.123+05:30	38	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
b6588753-d0c4-4fe4-833f-068fa5c28dba	d546fa92-ccde-4634-bae2-ed2faa473ac7	Fresh Table Butter (200g)	Creamy, salted pure dairy butter, perfect for toast and baking.	105	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-14-936	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	100	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
daf3abee-4046-428f-846d-a6916183465d	d546fa92-ccde-4634-bae2-ed2faa473ac7	Fresh Malai Paneer (200g)	Extra soft, cottage cheese made from fresh buffalo milk.	95	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-16-212	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	90	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
2dc9b943-8d81-47a8-b30d-f5999f78f578	d546fa92-ccde-4634-bae2-ed2faa473ac7	Whole Wheat Bread (400g)	Soft and healthy sliced brown sandwich bread baked fresh daily.	45	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-17-175	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	43	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
65f6c817-3041-4857-bfdb-177bde1599f6	d546fa92-ccde-4634-bae2-ed2faa473ac7	Iodized Crystal Salt (1kg)	Clean, double-refined edible crystal salt with optimal iodine content.	20	INR	["https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-18-367	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	19	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
a899f38a-df13-4dbc-99ed-581ce1a0d0e6	d546fa92-ccde-4634-bae2-ed2faa473ac7	Refined White Sugar (1kg)	Premium sulphur-free crystal white sugar, clean and dry.	48	INR	["https://images.unsplash.com/photo-1610348725531-843dff14446c?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-19-732	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	46	\N	\N	{"unit": "kg"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
77e8526a-9452-43b5-9879-d962c1d6c12d	d546fa92-ccde-4634-bae2-ed2faa473ac7	Organic Turmeric Powder (200g)	High-curcumin grounded turmeric, perfect for culinary and health use.	55	INR	["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-20-286	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	52	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
991a74b9-1400-4302-bf22-5303f96a7fae	d546fa92-ccde-4634-bae2-ed2faa473ac7	Kashmiri Red Chilli Powder (200g)	Authentic Kashmiri chillies ground to a fine red powder, mild heat, rich color.	75	INR	["https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-21-589	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	71	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
894b771e-3592-431a-90c1-c74542e422db	d546fa92-ccde-4634-bae2-ed2faa473ac7	Raw California Almonds (250g)	Premium, whole, crunchy raw almonds, packed with vitamin E.	220	INR	["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-22-734	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	209	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
0bc6b3cc-53b0-4e18-b576-7ab16c2e4763	d546fa92-ccde-4634-bae2-ed2faa473ac7	Premium Cashew Nuts (250g)	Large, clean and crisp whole cashew nuts, premium selection.	240	INR	["https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-23-191	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	228	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
930c4141-8807-434c-bc1f-48ab4761e44e	88069782-38a4-497d-9cd9-86b4114f43cb	Dal Tadka Special	Smooth yellow lentils tempered with ghee, cumin seeds, garlic, and dry red chillies.	110	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	FOOD-NAG-21-964	100	t	f	2026-05-24 14:37:32.519+05:30	2026-06-01 23:22:03.119+05:30	105	\N	\N	{"unit": "Pc"}	37f3f942-8dec-4e17-8e90-c62f9cf2717d	veg	f	15	[]	\N	\N	{}
1ab075da-d922-438b-93e5-953caa11b1ba	51247ef2-040e-4f46-b3de-25ffd3916dcd	Sweet Kesari Bath	Delectable sweet semolina pudding flavored with saffron, ghee, and loaded with cashew nuts and raisins.	50	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-5-968	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.125+05:30	48	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
b2585a56-f721-4a0c-9f6f-7d86c3d0d59b	01c56244-fde9-4372-b2fc-da4288f161b7	Aromatic Sweet Basil (50g)	Fresh Italian sweet basil leaves, perfect for pesto.	40	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-005	45	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.132+05:30	36	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
5c94a9d6-4e73-4c9b-8961-00b45dd58074	01c56244-fde9-4372-b2fc-da4288f161b7	American Sweet Corn (2 Pcs)	Plump, sweet golden corn on the cob.	50	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-030	100	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.135+05:30	45	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
37d1e4d3-92e7-4264-b51e-6925a702b0f2	42c023ee-8378-48be-a641-5b13a6fba3cd	Aged Parmigiano Reggiano (200g)	Aged for 24 months, rich, granular, and nutty Italian cheese.	490	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	TGP-CHS-001	40	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.138+05:30	441	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
db16197e-5e40-4354-a050-3828279da15e	42c023ee-8378-48be-a641-5b13a6fba3cd	Arborio Rice for Risotto (1kg)	High starch round grain rice, makes risottos super creamy.	350	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	TGP-PST-017	65	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.138+05:30	315	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
7a2c03eb-4de4-40d1-81fc-2f0be017164e	42c023ee-8378-48be-a641-5b13a6fba3cd	Extra Virgin Olive Oil (500ml)	Cold pressed, single source Italian olives, peppery finish.	899	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	TGP-OIL-021	80	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.139+05:30	809	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
41933789-bbca-4899-854e-5b37d4b3d2df	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Cinnamon Sticks / Dalchini (100g)	Sweet, woody whole cassia cinnamon bark.	110	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-WSP-014	90	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.142+05:30	99	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
27f950b8-6502-49cc-bc67-7f3f7cf3aa4f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Thick Poha / Flattened Rice (500g)	Flattened rice flakes, ideal for breakfast Poha.	40	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	SHC-FLR-037	220	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.145+05:30	36	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
e55baa5e-1652-45ce-9eaf-85db8e13e3ea	15b0d44c-efc7-4255-a6df-6ee823d86292	Sweet Plain Yogurt / Dahi (400g Cup)	Thick, creamy, set pasteurized plain yogurt.	45	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	DNS-DY-004	180	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.147+05:30	41	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
8a228ca0-2db4-4a29-9704-bc80e198f609	15b0d44c-efc7-4255-a6df-6ee823d86292	Lipton Green Tea Lemon (100 Bags)	Pure green tea bags infused with natural lemon flavor.	350	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	DNS-BEV-019	95	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.15+05:30	315	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
588bb849-046d-4675-aa58-a002ccc3a2a7	d546fa92-ccde-4634-bae2-ed2faa473ac7	Pure Assam Tea Dust (500g)	Strong, premium quality tea blend sourcing leaves from finest Assam gardens.	190	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-24-109	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	181	\N	\N	{"unit": "g"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
25321e56-53f9-4925-9d95-e7d2ae3c0c45	d546fa92-ccde-4634-bae2-ed2faa473ac7	Dishwash Liquid Gel (500ml)	Concentrated lemon gel formulation, cuts grease effortlessly and leaves fresh scent.	110	INR	["https://images.unsplash.com/photo-1607006342411-9a336f52431d?q=80&w=600&auto=format&fit=crop"]	GROC-GOK-25-455	100	t	f	2026-05-24 14:37:32.525+05:30	2026-05-24 14:37:32.525+05:30	105	\N	\N	{"unit": "L"}	f0fb8be9-0626-436f-accb-c9eda11d0b08	veg	f	15	[]	\N	\N	{}
7f88b936-97b1-4aed-975b-588bb323357f	51247ef2-040e-4f46-b3de-25ffd3916dcd	Mysore Masala Dosa	Crispy rice crepe smeared with hot garlic chutney, stuffed with mashed potato and served with sambar and coconut chutney.	90	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-1-519	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	86	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
b3fe2c3f-7cbf-4a41-8d51-35b0fef107a7	51247ef2-040e-4f46-b3de-25ffd3916dcd	Steaming Idli Sambar (2 Pcs)	Soft and fluffy steamed rice cakes served with hot lentil sambar and fresh coconut chutney.	45	INR	["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-2-760	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	43	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
60925220-4640-4472-84bf-04f6bf17ab58	51247ef2-040e-4f46-b3de-25ffd3916dcd	Crispy Medu Vada (2 Pcs)	Golden brown, donut-shaped crispy lentil fritters spiced with ginger and black pepper.	50	INR	["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-3-766	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	48	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
9b2c2499-6e75-453a-8b37-df6d29e598b4	51247ef2-040e-4f46-b3de-25ffd3916dcd	Rava Khara Bath	Traditional savory semolina pudding cooked with ghee, mixed vegetables, curry leaves, and mustard seeds.	55	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-4-813	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	52	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
6ede4bc1-6021-4306-b8c2-eb3a9265e106	01c56244-fde9-4372-b2fc-da4288f161b7	Sweet Cherry Tomatoes (250g)	Bite-sized, incredibly sweet red cherry tomatoes.	80	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-025	50	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.126+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
eb32112c-9746-4975-a952-913458afb65a	01c56244-fde9-4372-b2fc-da4288f161b7	Button Mushrooms (200g Box)	Earthy, fresh white button mushrooms.	60	INR	["https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-026	85	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.126+05:30	54	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
ebd0c1a7-5f6e-4a10-8197-d243976574c3	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Shiitake Mushrooms (100g)	Fragrant, savory shiitake mushrooms.	180	INR	["https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-027	20	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.127+05:30	162	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
6614b62b-44d4-49bd-9adf-fb2d3ea782cc	15b0d44c-efc7-4255-a6df-6ee823d86292	Soft Burger Buns (Pack of 4)	Fresh, fluffy round sesame burger buns.	35	INR	["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"]	DNS-BAK-024	90	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.151+05:30	32	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
91946902-2149-4542-9cba-3ae7003e6d8b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Barista Almond Milk (1L)	Unsweetened, ultra-creamy almond milk for coffees.	320	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	NBP-MLK-001	80	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.153+05:30	288	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
1be3b0fe-0cc9-45bf-800e-a12821fa21ab	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Culinary Thick Coconut Milk (400ml)	Rich, double-extracted coconut milk for cooking.	90	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	NBP-MLK-004	140	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.155+05:30	81	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
66cda599-8120-4823-b3aa-49266fd181fb	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Ceremonial Matcha Green Tea (50g)	Stone ground shade grown green tea powder from Uji, Japan.	890	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	NBP-SUP-021	25	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.156+05:30	801	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
7a9bf3d7-1be7-4f59-9b23-3eef2e325a90	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Peppermint Herbal Tea (25 Bags)	Cooling, refreshing pure peppermint leaves tea.	220	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	NBP-SUP-026	100	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.157+05:30	198	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
d99ffaa5-15b7-4bdb-93bd-cca4d8be601c	51247ef2-040e-4f46-b3de-25ffd3916dcd	Paneer Butter Masala	Soft cottage cheese cubes simmered in a rich, buttery, and creamy tomato gravy.	180	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-8-699	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.127+05:30	171	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
8cce2985-ae9b-4edc-bcb0-1def4348e6d8	51247ef2-040e-4f46-b3de-25ffd3916dcd	Poori Sagu (3 Pcs)	Puffed, deep-fried wheat breads served with a delicious potato and mixed vegetable gravy.	75	INR	["https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-6-189	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	71	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
d2bec554-12ef-4dcc-8b20-c539e7f1a58f	51247ef2-040e-4f46-b3de-25ffd3916dcd	Premium Degree Filter Coffee	Authentic South Indian chicory blend coffee brewed in brass filters and served frothy with hot milk.	35	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-7-516	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	33	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
4d95f159-7282-4f0b-afd0-b1975ee87d47	51247ef2-040e-4f46-b3de-25ffd3916dcd	Gobi Manchurian Dry	Crispy fried cauliflower florets tossed in a sweet, spicy, and tangy Indo-Chinese sauce.	120	INR	["https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-11-289	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	114	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
b6323dbd-ce8b-4fbf-bba2-2a84c6191c59	51247ef2-040e-4f46-b3de-25ffd3916dcd	Mango Lassi	Creamy, sweet yogurt drink blended with ripe Alphonso mango pulp.	70	INR	["https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-13-398	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	67	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
eec2e9b5-1cad-419d-adc5-efb18d557d88	51247ef2-040e-4f46-b3de-25ffd3916dcd	Fresh Lime Mint Juice	Refreshing cold beverage made from freshly squeezed limes, crushed mint, and ice.	45	INR	["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-14-346	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	43	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
81f6b191-ca2c-4bec-acbd-7f08f1ad0b7d	51247ef2-040e-4f46-b3de-25ffd3916dcd	Chola Bhatura Platter	Large fluffy fried leavened bread served with spicy, tangy chickpea curry and pickle.	140	INR	["https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-18-356	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	133	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
fd5f6eaa-00d6-457a-9223-78c3c4219659	51247ef2-040e-4f46-b3de-25ffd3916dcd	Onion Uttapam	Thick, savory rice crepe topped with finely chopped red onions, green chillies, and fresh coriander.	85	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-19-653	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	81	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
18aebc62-5b0a-4d75-9aed-f67ab31d42b5	51247ef2-040e-4f46-b3de-25ffd3916dcd	Butter Naan (1 Pc)	Soft, leavened clay-oven flatbread brushed with abundant melted butter.	40	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-9-440	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.128+05:30	38	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
79e29d2c-8058-40e2-a1ed-ce853e1a7ef3	51247ef2-040e-4f46-b3de-25ffd3916dcd	Veg Donne Biryani	Aromatic Jeera Samba rice cooked with fresh mint, coriander, whole spices, and vegetable chunks, served in a leaf cup.	160	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-10-857	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.128+05:30	152	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
400122e3-5111-4407-9650-369f46eead47	51247ef2-040e-4f46-b3de-25ffd3916dcd	Veg Fried Rice	Fragrant basmati rice stir-fried in a wok with fresh spring onions, carrots, beans, and light soy sauce.	130	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-12-446	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.129+05:30	124	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
6b27e39e-9819-4457-9c2c-df39d705625a	51247ef2-040e-4f46-b3de-25ffd3916dcd	Hot Badam Milk	Warm milk flavored with saffron, cardamom, and almond paste, topped with almond flakes.	50	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-15-994	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.129+05:30	48	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
7d7ace6a-0c17-454b-baaf-654899667ea2	51247ef2-040e-4f46-b3de-25ffd3916dcd	Gulab Jamun (2 Pcs)	Deep-fried milk dumplings soaked in a warm, sweet cardamom-infused sugar syrup.	60	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-16-657	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.129+05:30	57	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
90172466-d955-4499-a1a4-a2cb37e8e203	51247ef2-040e-4f46-b3de-25ffd3916dcd	Traditional Mysore Pak	Rich and crumbly premium sweet made from pure ghee, gram flour, and sugar.	80	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-17-957	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.13+05:30	76	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
335c66ce-9a5a-414d-86eb-a4f983837062	51247ef2-040e-4f46-b3de-25ffd3916dcd	Vegetable Pulav	Fragrant one-pot rice dish loaded with seasonal vegetables and mild Indian spices.	120	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-20-329	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.13+05:30	114	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
dbbd72f6-3b32-449d-996c-7ea7d35b7df1	51247ef2-040e-4f46-b3de-25ffd3916dcd	Dal Tadka Special	Smooth yellow lentils tempered with ghee, cumin seeds, garlic, and dry red chillies.	110	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-21-897	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.131+05:30	105	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
6852814e-4cc5-472c-be10-6c2f140c5d94	51247ef2-040e-4f46-b3de-25ffd3916dcd	Jeera Rice	Basmati rice cooked with clarified butter ghee and roasted cumin seeds.	90	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-22-695	100	t	f	2026-05-24 14:37:32.531+05:30	2026-06-01 23:22:03.131+05:30	86	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
0e615bf1-2f6f-4166-8da9-9267dd11bf2b	03aede88-26df-4e0b-9766-0863c0277002	1fdf	111fdsafds	250	INR	["http://localhost:3008/images/8a20d719-0d8a-43c5-b6f9-bb3eb3013fbd_WhatsApp Image 2026-05-08 at 6.35.51 PM.jpeg"]	25	25	f	t	2026-06-03 12:49:50.728+05:30	2026-06-03 12:49:58.961+05:30	250	food		{"cgst": 0, "sgst": 0, "foodType": "Other", "otherTaxes": 0}	5435a027-bf16-425c-af23-3f7c858cc9e0	veg	f	15	[]	\N	\N	{}
6744f13d-1690-43ae-b211-51315e615b96	f3170057-94d6-4a8c-9d45-1732e09f1b96	Organic Whole Milk 1L	\N	85	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	MILK-ORG-1L-1779087051175	50	t	f	2026-05-18 12:20:51.175+05:30	2026-06-01 23:22:03.131+05:30	0	\N	\N	{"brand": "Amul Organics", "expiry": "4 days from packing", "weight": "1 Litre"}	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	veg	f	15	[]	\N	\N	{}
c2aef503-eca3-40c6-aebc-872b9ad99ebb	f3170057-94d6-4a8c-9d45-1732e09f1b96	Gluten-Free Sourdough Bread	\N	120	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	BREAD-GF-1779087051176	20	t	f	2026-05-18 12:20:51.176+05:30	2026-06-01 23:22:03.132+05:30	0	\N	\N	{"brand": "Artisan Oven", "expiry": "3 days from packing", "weight": "400 grams"}	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	veg	f	15	[]	\N	\N	{}
0714b4b4-19c5-4575-b851-a9cdc3b4a6e3	51247ef2-040e-4f46-b3de-25ffd3916dcd	Mini South Indian Thali	Rice, Sambar, Rasam, one dry vegetable curry, curd, papad, and a sweet.	150	INR	["https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-23-466	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	143	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
17e30efb-dd1a-41aa-9f8d-b6c153e6ed74	51247ef2-040e-4f46-b3de-25ffd3916dcd	Sizzling Brownie with Ice Cream	Fudgy warm chocolate brownie served on a hot sizzler plate with vanilla ice cream and chocolate syrup.	160	INR	["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-24-683	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	152	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
0f516298-a566-4621-9b8d-b0fea49f47b8	51247ef2-040e-4f46-b3de-25ffd3916dcd	Cold Badam Kulfi	Creamy, slow-churned Indian frozen dessert flavored with saffron and almonds.	65	INR	["https://images.unsplash.com/photo-1579631542720-3a87824ffd8e?q=80&w=600&auto=format&fit=crop"]	FOOD-DHA-25-118	100	t	f	2026-05-24 14:37:32.531+05:30	2026-05-24 14:37:32.531+05:30	62	\N	\N	{"unit": "Pc"}	8d6292bf-1238-4326-920b-35ba543a7ac8	veg	f	15	[]	\N	\N	{}
5dfd402f-a60c-4766-9d02-279c23d48541	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Spinach (250g)	Freshly harvested organic baby spinach leaves, pre-washed.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-001	80	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	41	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
2855a115-9ca2-44ae-b286-78091b68c3f7	01c56244-fde9-4372-b2fc-da4288f161b7	Hydroponic Butterhead Lettuce (1 Pc)	Crisp, hydroponically grown butterhead lettuce, rich in flavor.	99	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-002	30	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.132+05:30	89	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
14619bb5-b9d9-4ed4-bc13-392b389fb33b	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Coriander Bunch (100g)	Bright green, highly aromatic coriander leaves.	15	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-003	150	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	14	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
1195d9ab-abf1-4b72-9548-cd670746bd6d	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Mint Leaves (100g)	Peppery, refreshing mint leaves perfect for teas and chutneys.	20	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-004	120	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	18	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
116496c8-2d23-41c6-84da-163f9dbdf9f9	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Rosemary (30g)	Woody, fragrant fresh rosemary sprigs for roasting.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-006	25	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
21c27716-62d7-49b5-9d6b-56d10d433c0e	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Thyme (30g)	Delicate, earthy thyme sprigs perfect for savory dishes.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-007	25	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
449302de-bddb-4e5e-bd27-e91a1cf6e9a2	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Curry Leaves (50g)	Highly aromatic curry leaves, key to South Indian tempering.	12	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-008	180	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	11	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
5acdc275-e701-4b3c-a5e5-7ddf0303756c	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Curly Kale (150g)	Nutrient-rich, dark curly green kale leaves.	80	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-010	40	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
452e9aa8-c974-4891-9cac-e7cc98e17d0c	01c56244-fde9-4372-b2fc-da4288f161b7	English Cucumber (500g)	Crisp, seedless English greenhouse cucumbers.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-012	90	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	41	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
7ddcab30-74ee-458a-9634-c8b48f7730a2	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Carrots (500g)	Sweet, earthy orange organic carrots.	55	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-013	110	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	50	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
a5cc3576-d059-4a92-b093-2f821e91a80b	01c56244-fde9-4372-b2fc-da4288f161b7	Red Beetroots (500g)	Deep red, earthy and nutrient-dense beetroots.	35	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-014	85	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	32	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
be00e83c-7a07-40bc-a4e3-5c682c382e0b	01c56244-fde9-4372-b2fc-da4288f161b7	Organic White Garlic (200g)	Pungent, strong local organic white garlic cloves.	70	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-017	150	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	63	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
4264acd4-cffa-4d76-9f03-ae56edbb24d5	01c56244-fde9-4372-b2fc-da4288f161b7	Earthy Ginger (250g)	Fresh, spicy ginger roots with thin skin.	65	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-018	130	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	59	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
7c513a32-2761-4431-9b59-dded2cd324bb	01c56244-fde9-4372-b2fc-da4288f161b7	Spicy Green Chillies (100g)	Hot, slender green chillies, freshly picked.	18	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-019	160	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	16	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
696afe87-afbc-4ada-beb0-892808059fb1	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Lemon (Pack of 4)	Juicy, zesty yellow lemons rich in vitamin C.	25	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-020	140	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	23	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
1cf474fa-587b-42a7-9afe-2096f9abe36c	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Zucchini Green (500g)	Tender, mild green summer squash.	85	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-021	55	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	77	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
ebfcc011-a771-4579-8113-2e8c7941d61c	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Zucchini Yellow (500g)	Vibrant yellow, sweet summer zucchini.	95	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-022	45	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	86	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
7640090d-d034-47c3-a24f-03dc763de03e	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Crown Broccoli (1 Pc)	Crisp green broccoli crowns, packed with fiber.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-023	65	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	81	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
4157a103-fc6a-478f-8042-21a054c31761	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Red Cabbage (500g)	Crisp, colorful red/purple cabbage head.	65	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-024	40	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	59	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
fc1b4547-4e55-49ac-8151-521b97381073	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Spring Onion Bunch (250g)	Crisp green shoots with mild white bulbs.	35	INR	["https://images.unsplash.com/photo-1508747703725-719ae2c73ee1?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-009	70	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.133+05:30	32	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
cf6c92a9-5604-47d1-8523-3b45e52c6f99	01c56244-fde9-4372-b2fc-da4288f161b7	Country Red Tomatoes (1kg)	Juicy, vine-ripened local red tomatoes.	60	INR	["https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-011	200	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.133+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c32992dd-6899-4472-8927-eb8924da5d08	01c56244-fde9-4372-b2fc-da4288f161b7	Premium Jyoti Potatoes (1kg)	High-quality earthy Jyoti baking potatoes.	40	INR	["https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-015	300	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.134+05:30	36	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
a7acccdf-d787-4b4c-90f8-c109f7fb7c2c	01c56244-fde9-4372-b2fc-da4288f161b7	Nasik Red Onions (1kg)	Pungent, sweet premium red onions from Nasik.	50	INR	["https://images.unsplash.com/photo-1508747703725-719ae2c73ee1?q=80&w=600&auto=format&fit=crop"]	FGO-VEG-016	400	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.135+05:30	45	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
681229b4-2880-4399-9b2f-ce2ad8595b15	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Green Asparagus (250g)	Tender, young green asparagus spears.	220	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-028	25	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	198	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c1c24f8f-0829-4bbd-84ad-ecd0045e8bb9	01c56244-fde9-4372-b2fc-da4288f161b7	Tender Baby Corn (200g Pack)	Sweet, crisp baby corn cobs.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-029	75	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	41	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
2b8bfb6d-0415-4a92-ba0e-61c4fc153b47	01c56244-fde9-4372-b2fc-da4288f161b7	Hass Avocado (Pack of 2)	Creamy, rich imported Hass avocados, ready to eat.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-031	40	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
550ae108-df8d-4290-b831-ab691f7987d6	01c56244-fde9-4372-b2fc-da4288f161b7	Premium Alphonso Mangoes (6 Pcs)	King of Mangoes, sweet, fiberless rich pulp.	799	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-034	30	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	719	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
a54f8d0d-47b6-4243-b05b-edbb0d8a0f6e	01c56244-fde9-4372-b2fc-da4288f161b7	Kabul Ruby Pomegranate (2 Pcs)	Large, dark red pomegranate packed with juicy arils.	190	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-037	80	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	171	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
e0629f7c-09ea-4aaa-9b71-047179d1a580	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Kiwi Fruit (Pack of 3)	Zesty, emerald green kiwi fruits with black seeds.	99	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-038	110	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	89	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
77490c74-4f94-429c-a1c6-430073ddb48c	01c56244-fde9-4372-b2fc-da4288f161b7	Red Dragon Fruit (1 Pc)	Exotic, vibrant pink flesh dragon fruit, sweet taste.	130	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-039	55	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	117	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
b6f4ccee-d833-4bc6-a874-29154f96db3f	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Strawberries (200g Box)	Sweet, crimson strawberries grown in Mahabaleshwar.	149	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-041	45	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	134	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
61b1310c-8963-4970-bcec-03c4fd386c1a	01c56244-fde9-4372-b2fc-da4288f161b7	Imported Blueberries (125g Cup)	Plump, antioxidant-rich dark blue berries.	249	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-042	50	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	224	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
2764ff67-9c17-4469-be61-ac14342f30f6	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Raspberries (125g Cup)	Tangy, soft red raspberries.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-043	25	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
071b440c-94ac-4bd4-ad56-28525867bc0d	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Blackberries (125g Cup)	Sweet, glossy deep black berries.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-044	20	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c703e5b1-158c-4238-b952-465c30f9a02e	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Passion Fruit (Pack of 2)	Tart, aromatic, gelatinous yellow passion fruit.	120	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-045	35	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	108	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c81e8e05-e842-419c-a754-708ac7e87c69	01c56244-fde9-4372-b2fc-da4288f161b7	Imported Red Cherries (250g)	Sweet, dark red juicy premium table cherries.	450	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-046	15	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	405	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
f1b00cab-aa64-4165-b8db-30c2fd251e10	01c56244-fde9-4372-b2fc-da4288f161b7	Hydroponic Romaine Lettuce (1 Pc)	Crisp, elongated leaves perfect for Caesar Salad.	110	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-047	30	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	99	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c150c815-41cc-4aa7-b627-da51d33ac073	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Bell Peppers Yellow (250g)	Sweet, bright yellow sweet bell pepper.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-048	60	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	81	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
8df2b7da-2f9f-4c80-98be-bc98dfac5927	01c56244-fde9-4372-b2fc-da4288f161b7	Royal Gala Red Apples (4 Pcs)	Crisp, sweet, and lightly striped red apples.	180	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	FGO-FRU-032	95	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.136+05:30	162	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
e0635fd7-9cfa-4343-9ac4-fb1158943630	01c56244-fde9-4372-b2fc-da4288f161b7	Green Granny Smith Apples (4 Pcs)	Tart, crisp green apples perfect for baking/juicing.	220	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	FGO-FRU-033	60	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.136+05:30	198	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
39c18c0f-d1de-49c5-8390-7a6c24157408	01c56244-fde9-4372-b2fc-da4288f161b7	Robusta Bananas (1 Dozen)	Sweet, ripe and energizing yellow bananas.	70	INR	["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop"]	FGO-FRU-035	180	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.137+05:30	63	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
3d38c159-50c3-473f-b863-8539993b4e32	01c56244-fde9-4372-b2fc-da4288f161b7	Sweet Papaya (1 Pc / ~1.2kg)	Ripe, orange-fleshed sweet local papaya.	80	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	FGO-FRU-036	70	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.137+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
98941880-5559-430d-9f26-fe111867c3f9	01c56244-fde9-4372-b2fc-da4288f161b7	Valencia Oranges (1kg)	Juicy, sweet oranges perfect for squeezing.	160	INR	["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop"]	FGO-FRU-040	90	t	f	2026-05-26 13:19:27.021+05:30	2026-06-01 23:22:03.137+05:30	144	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
8756f045-5aa6-42ad-a96c-3e10d2a2b172	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Bell Peppers Red (250g)	Thick, sweet, bright red bell pepper.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-049	60	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	81	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
b29ac203-c871-42a3-96b0-55341ce9c089	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Cauliflower (1 Pc)	Tight, white cauliflower curd surrounded by green leaves.	50	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-050	100	t	f	2026-05-26 13:19:27.021+05:30	2026-05-26 13:19:27.021+05:30	45	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N	{}
c1ef541d-be50-47fc-a005-9291ee992778	42c023ee-8378-48be-a641-5b13a6fba3cd	Mature English Cheddar (150g)	Sharp, crumbly aged English farmhouse cheddar cheese.	320	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-002	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	288	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
d6487216-4eb1-4474-8c0d-b8c37849d1ea	42c023ee-8378-48be-a641-5b13a6fba3cd	Dutch Gouda Cheese Wheel (200g)	Creamy, mild semi-hard yellow cheese from Holland.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-003	45	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
a1f1cf33-bd69-47c0-910d-c55be9e2f4f4	42c023ee-8378-48be-a641-5b13a6fba3cd	French Brie Double Cream (125g)	Soft-ripened, buttery, and incredibly creamy cheese.	380	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-004	30	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	342	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
bf2609ee-ce5a-487d-ade5-9da2404c36e9	42c023ee-8378-48be-a641-5b13a6fba3cd	French Camembert (250g)	Rich, earthy, soft-ripened cow's milk cheese.	420	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-005	25	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	378	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
9143436f-c0bc-4251-ba05-27708486169e	42c023ee-8378-48be-a641-5b13a6fba3cd	Mozzarella Di Bufala Campana (125g)	Fresh buffalo mozzarella balls in brine, soft and milky.	280	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-006	35	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	252	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
83a2dd4f-c9fd-40ca-a696-c1bcc47442fb	42c023ee-8378-48be-a641-5b13a6fba3cd	Traditional Greek Feta (200g)	Crumbly, tangy sheep and goat milk feta cheese in brine.	250	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-007	60	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	225	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
2a39572f-d6fa-4766-bdf9-91275640ed89	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Gorgonzola Blue Cheese (150g)	Veined blue cheese, buttery, crumbly, and sharp flavor.	390	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-008	20	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	351	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
3b54defa-aba5-4bbd-9292-9ecc021cdd2a	42c023ee-8378-48be-a641-5b13a6fba3cd	Fresh Italian Ricotta (200g)	Creamy, light, and mildly sweet whey cheese.	180	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-009	40	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
5deb7c1e-94cf-43ad-a9ea-cefe1eacac3f	42c023ee-8378-48be-a641-5b13a6fba3cd	Premium Mascarpone (250g)	Rich Italian double-cream cheese, essential for Tiramisu.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-010	35	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
9037fee2-fd89-4410-8904-9c11c141e4eb	42c023ee-8378-48be-a641-5b13a6fba3cd	Bronze-Cut Penne Rigate (500g)	Rough textured artisanal penne, absorbs sauce perfectly.	175	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-011	100	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	158	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
cc3b5d29-1251-4523-a3a3-bbd3eed2e430	42c023ee-8378-48be-a641-5b13a6fba3cd	Artisanal Bronze-Cut Spaghetti (500g)	Long, slow-dried Italian durum wheat spaghetti.	175	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-012	120	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	158	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
dd9ca133-cfbf-4f3e-a363-8825e17baffb	42c023ee-8378-48be-a641-5b13a6fba3cd	Durum Wheat Fusilli (500g)	Spiraled pasta shapes, ideal for heavy cream/meat sauces.	160	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-013	90	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	144	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
5739ecfb-b8a8-4f00-8b18-0058974c7f62	42c023ee-8378-48be-a641-5b13a6fba3cd	Bronze-Cut Farfalle (500g)	Butterfly/Bowtie-shaped classic Italian dry pasta.	180	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-014	80	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
175bf0bb-e26d-4a81-8592-ec75c41298e7	42c023ee-8378-48be-a641-5b13a6fba3cd	Tuscan Durum Wheat Fettuccine (500g)	Ribbon-shaped pasta, superb for Alfredo/carbonara.	195	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-015	70	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	176	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
bee37e70-7af8-463b-b4e1-bafffe9b681e	42c023ee-8378-48be-a641-5b13a6fba3cd	Classic Lasagna Sheets (500g Box)	Flat pasta sheets ready to oven bake with cheese.	210	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-016	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	189	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
90c80b21-9506-49ff-a51c-74c2adb0aca4	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Royal White Quinoa (500g)	Nutrient-rich, gluten-free complete plant protein.	240	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-018	85	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	216	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
7a9d317f-1681-4f6b-a548-307644ad1952	42c023ee-8378-48be-a641-5b13a6fba3cd	French Couscous (500g Pack)	Steamed semolina granules, light and fluffy.	190	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-019	75	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	171	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
8855389e-db2a-43d0-acb7-c7ea896ceeca	42c023ee-8378-48be-a641-5b13a6fba3cd	Stone-Ground Italian Polenta (500g)	Coarse yellow cornmeal, rich and comforting.	180	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-020	45	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
81623c9a-be38-430b-988a-d72873859de0	42c023ee-8378-48be-a641-5b13a6fba3cd	Balsamic Vinegar of Modena IGP (250ml)	Aged in wooden casks, sweet, dark, syrup-like glaze.	450	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-023	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	405	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
edc2cf7c-75b7-481e-94c7-2913d6601011	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Red Wine Vinegar (500ml)	Aged red wine vinegar, great for salad vinaigrettes.	220	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-025	60	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	198	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
01a0a33c-1d43-4561-b174-fad796031071	42c023ee-8378-48be-a641-5b13a6fba3cd	Gourmet Basil Pesto (190g Jar)	Made with fresh basil, pine nuts, garlic, and Grana Padano.	240	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-028	55	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	216	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
66d25420-21dc-46bc-b171-a8b68fca6117	42c023ee-8378-48be-a641-5b13a6fba3cd	Slow Cooked Marinara Sauce (350g)	San Marzano tomatoes simmered with garlic, basil, and EVOO.	199	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-029	75	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	179	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
f78c6b35-5209-4212-9035-55bc6e37a20b	42c023ee-8378-48be-a641-5b13a6fba3cd	Creamy Classic Alfredo Sauce (350g)	Rich cream sauce made with butter and aged parmesan.	220	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-030	65	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
9a4e9be7-fcd4-4f37-8a69-827519aa1520	42c023ee-8378-48be-a641-5b13a6fba3cd	French Dijon Mustard (200g)	Smooth, sharp, traditional French mustard from Dijon.	180	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-031	85	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
e6964ebe-37b3-42b3-8022-c437acec6f45	42c023ee-8378-48be-a641-5b13a6fba3cd	Whole Grain Mustard (200g)	Coarse, textured mustard seeds in white wine.	190	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-032	75	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	171	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
8c75ad3b-7cf9-4c94-b804-a97911250b1e	42c023ee-8378-48be-a641-5b13a6fba3cd	Sriracha Chilli Hot Sauce (480g)	Traditional spicy sun-ripened chili garlic paste.	299	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-034	110	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	269	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
b0ee9f70-a8ec-44fe-99ce-dac9a9d8bc89	42c023ee-8378-48be-a641-5b13a6fba3cd	Hickory Smoked BBQ Sauce (350g)	Tangy, sweet sauce with deep woodsmoke flavor.	180	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-035	120	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
2e876435-5d22-4f5a-ab72-8872cecc14bf	42c023ee-8378-48be-a641-5b13a6fba3cd	Dark Chocolate Bark w/ Sea Salt (100g)	70% cacao dark chocolate shards sprinkled with Maldon sea salt.	220	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-036	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
aa21d096-4f81-4965-b3f1-de52990fbcd5	42c023ee-8378-48be-a641-5b13a6fba3cd	Macarons Assortment (Pack of 6)	Assorted flavors: Pistachio, Raspberry, Chocolate, Lemon.	450	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-038	20	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	405	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
feb01dad-37fa-473b-8980-0599f1e5bca0	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Roasted Hazelnut Spread (350g)	High hazelnut content cocoa spread, dairy-free.	349	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-039	60	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	314	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
ab50e529-025d-434e-a2b7-91e74bee0d8b	42c023ee-8378-48be-a641-5b13a6fba3cd	White Truffle Infused Olive Oil (250ml)	Vibrant EVOO infused with premium white truffle aroma.	1499	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	TGP-OIL-022	15	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.14+05:30	1349	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
960a9052-0fbc-4a41-ac35-e41fbaa92a68	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Apple Cider Vinegar ACV (500ml)	With "Mother", raw, unfiltered, healthy tonic.	280	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	TGP-OIL-024	95	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.14+05:30	252	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
4a40a20c-57f8-448f-a172-ba2dd086a4ef	42c023ee-8378-48be-a641-5b13a6fba3cd	Pure Cold Pressed Avocado Oil (250ml)	High smoke point oil, rich in monounsaturated fats.	650	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	TGP-OIL-026	30	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.141+05:30	585	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
d60cd38f-4615-457b-a1c8-a4c8a714c512	42c023ee-8378-48be-a641-5b13a6fba3cd	Toasted Sesame Oil (250ml)	Nutty, highly aromatic oil for Asian stir-fry recipes.	190	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	TGP-OIL-027	70	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.141+05:30	171	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
2899a425-517c-4fe2-8d01-ece6e3e441cf	42c023ee-8378-48be-a641-5b13a6fba3cd	Real Eggless Truffle Mayo (200g)	Creamy vegan mayo infused with black summer truffles.	160	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	TGP-SAU-033	90	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.142+05:30	144	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
a707d378-c6fb-4d4c-9445-046b1f4b7dd2	42c023ee-8378-48be-a641-5b13a6fba3cd	Salted Butter Caramel Spread (250g)	French-style sweet caramel with Guerande fleur de sel.	299	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	TGP-SNC-037	40	t	f	2026-05-26 13:19:27.042+05:30	2026-06-01 23:22:03.142+05:30	269	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
d85a3124-86dd-4a20-bbab-30d97c134611	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Pure Maple Syrup (250ml)	Grade A golden maple syrup imported from Canada.	699	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-040	35	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	629	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
fce76051-a970-4e4b-a1f9-440ccc73e41c	42c023ee-8378-48be-a641-5b13a6fba3cd	Lotus Biscoff Spread (400g)	Original caramelized speculoos cookie butter spread.	450	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-041	90	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	405	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
9e321078-a935-423f-9ba8-b44945019500	42c023ee-8378-48be-a641-5b13a6fba3cd	Sourdough Artisanal Crackers (150g)	Thin, crispy crackers, perfect for cheese platters.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-042	100	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	108	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
bea4f50c-926a-43c1-8098-7057156999c4	42c023ee-8378-48be-a641-5b13a6fba3cd	Stuffed Green Olives w/ Pimento (300g)	Spanish Queen green olives stuffed with sweet pimento.	220	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-043	80	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
b4928da7-2d4d-48e9-8393-3a5ff9846179	42c023ee-8378-48be-a641-5b13a6fba3cd	Kalamata Whole Dark Olives (300g)	Sun-ripened Greek dark purple olives in red wine vinegar.	240	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-044	70	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	216	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
a8b58b18-76ad-4fde-8b00-71ba70b0f2cd	42c023ee-8378-48be-a641-5b13a6fba3cd	Gourmet Wild Capers in Brine (100g)	Tiny, tangy, pickled flower buds from the Mediterranean.	150	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-045	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	135	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
26e877c3-bce0-4c9a-8a80-468c124ca692	42c023ee-8378-48be-a641-5b13a6fba3cd	Artisanal Herb Cheese Straws (100g)	Crispy puff pastry straws baked with cheddar and rosemary.	99	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-046	100	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	89	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
870db0b0-106e-47c6-a108-2f3ab590fbdf	42c023ee-8378-48be-a641-5b13a6fba3cd	White Wine Vinegar (500ml)	Tangy, clear white wine vinegar for fine dressings.	210	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-047	50	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	189	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
7d001608-6757-4266-af64-6899324f6ed0	42c023ee-8378-48be-a641-5b13a6fba3cd	Halloumi Cyprus Grilling Cheese (200g)	High melting point cheese, perfect to pan-sear.	390	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-048	30	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	351	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
8b6914d1-18e8-4a45-b3e2-7c3bc587d468	42c023ee-8378-48be-a641-5b13a6fba3cd	Aged Spanish Manchego (150g)	Firm sheep's milk cheese aged for 6 months.	490	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-049	25	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	441	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
e9cac975-d56f-478b-b205-dd0882cf3c93	42c023ee-8378-48be-a641-5b13a6fba3cd	Mascarpone Double Cream (250g)	Velvety, rich Italian double cream cheese.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-050	40	t	f	2026-05-26 13:19:27.042+05:30	2026-05-26 13:19:27.042+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N	{}
34585309-e6a6-45d5-b5bb-853096d413d4	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Turmeric Powder (200g)	Pure, high-curcumin ground turmeric from Salem.	45	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-001	300	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	41	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
98cf44ca-e886-45da-a0b1-09e0dc7cadd8	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kashmiri Red Chilli Powder (200g)	Mildly spicy chilli powder, gives vibrant red color.	80	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-002	250	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	72	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
a350b54a-c198-4503-a90a-cd04a08b09c6	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Coriander Powder (200g)	Ground coriander seeds, aromatic and fresh.	40	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-003	280	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	36	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
52cd8f84-a9f2-4bc5-90ab-6855bf2df5d6	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Roasted Cumin Powder (100g)	Dry-roasted and finely ground cumin seeds.	50	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-004	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	45	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
7f560d1a-228a-456d-95c0-cf24fdbd7006	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Authentic Garam Masala (100g)	Blend of 12 roasted whole aromatic spices.	65	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-005	200	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	59	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
bd526315-e2ea-4f60-8881-783ece05be1a	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cumin Seeds / Jeera (100g)	Highly aromatic cumin seeds for tempering.	55	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-006	220	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	50	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6ed97e5b-d23d-4987-a92f-33d3d75aefd9	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Black Mustard Seeds / Rai (100g)	Pungent black mustard seeds, high quality.	20	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-007	350	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	18	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
953c4775-0288-4237-8331-7de7135011ff	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fennel Seeds / Saunf (100g)	Sweet, anise-like seeds, digestive aid.	30	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-008	180	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	27	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6333ecd0-482f-46e3-bf80-86ec7d5c5985	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fenugreek Seeds / Methi (100g)	Bitter-sweet seeds, essential for pickles/curries.	25	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-009	190	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	23	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6cf6333e-b84b-4430-a7c3-dfc9d7f9a212	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Strong Asafoetida / Hing (50g)	Compounded, highly aromatic asafoetida powder.	90	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-010	120	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
3b8f7d70-b7c5-40a9-9e65-c3e8f30365d2	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Black Cardamom (50g)	Smoky, intensely warm whole black cardamom pods.	95	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-011	100	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	86	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
2c45d6f2-8c7b-433e-8d2d-ad53503758b6	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Green Cardamom (50g)	Highly fragrant, premium bold green cardamom.	160	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-012	120	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	144	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
9d10f3db-6750-4bd3-a090-e49705d2fd5f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cloves / Laung (50g)	Warm, highly aromatic whole cloves buds.	75	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-013	140	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
51321293-fb08-4882-9ba1-8f39e5cfb6f8	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Star Anise (50g)	Licorice-flavored star shaped pods.	80	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-015	80	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	72	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
c06bd2b5-d18f-4f30-94d0-0c23abb1e522	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Bay Leaves / Tejpatta (25g)	Sun dried, highly aromatic bay leaves.	25	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-016	200	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	23	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
b1a35ac9-2c20-4383-91e5-e2d69d5b0cd4	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Black Peppercorns (100g)	Pungent, hot black peppercorns from Malabar.	99	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-017	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	89	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
c40d3977-d51b-4f68-8b20-bf87827a01cc	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Nutmeg / Jaiphal (Pack of 3)	Sweet, highly fragrant whole nutmeg seeds.	40	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-018	100	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	36	\N	\N	{"unit": "Pc"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6a2f4c8b-6c05-4c8c-83c7-81e2086d0893	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Mace / Javitri Whole (20g)	Delicate, lace-like warm spice overlaying nutmeg.	120	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-019	50	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	108	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
141350a1-07ac-4500-94d1-2a7f737e2a71	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kashmiri Saffron / Kesar (1g)	Grade A premium dark red saffron threads.	350	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-020	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	315	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
ef3b9116-97dc-49ed-bd6f-9ba476ed0d36	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Rajma Chitra / Kidney Beans (1kg)	Spotted kidney beans, cook up super soft.	170	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-026	180	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	153	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
786381b8-2491-4a16-9f58-65297d3deea0	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kabuli Chana / White Chickpeas (1kg)	Bold, creamy white chickpeas, perfect for Chole.	150	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-027	250	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	135	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
18fb7308-e0cf-499b-98ed-7abc3b4728dc	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kala Chana / Black Chickpeas (1kg)	High-fiber, nutritious whole black chickpeas.	90	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-028	300	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
8900751f-6b1d-4f68-b9d6-c8e96d232fd4	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Green Peas Dried (500g)	Nutrient-rich dried green peas.	60	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-030	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	54	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6268de43-1b28-417c-99ea-3c0675c0351c	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Sharbati Whole Wheat Atta (5kg)	Stone-ground wheat flour from Sharbati grains.	299	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-031	400	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	269	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6e61092d-d2d6-48d3-a9b6-fd12f3cad38c	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Unpolished Toor Dal / Arhar (1kg)	High-protein unpolished split pigeon peas.	165	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-021	300	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.143+05:30	149	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
c5368cf6-097f-4139-bfec-6750b4c1acea	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Whole Moong Sabut (1kg)	Nutrient-rich, premium whole green mung beans.	140	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-022	250	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.143+05:30	126	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
b0e0ae7e-faf0-492f-9ed3-e9aca7d9ecb8	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Moong Dal Dhuli (1kg)	Husked and split green gram, easy to digest.	155	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-023	220	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.144+05:30	140	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
265bbcdd-66a2-4129-801f-5bb9cfe8b95f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Chana Dal (1kg)	Sweet, nutty unpolished split Bengal gram.	110	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-024	280	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.144+05:30	99	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
7d1aa499-ddef-4c84-b61f-36a71fc393a2	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Urad Dal Whole Black (1kg)	Whole black gram, essential for Dal Makhani.	145	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-025	200	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.145+05:30	131	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
99d19fc0-b352-4ba5-a95c-505874397e19	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Split Masoor Dal / Red Lentils (1kg)	Fast cooking red split lentils.	115	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-DAL-029	240	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.145+05:30	104	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
6f2d3a24-634a-4454-896e-8b336373e51f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Maida Fine Wheat Flour (1kg)	Superfine wheat flour for baking and flatbreads.	50	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-032	200	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	45	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
e96590cd-29ee-492c-9e2a-40b807516aee	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fine Sooji / Semolina (1kg)	Coarse semolina, excellent for Upma/Halwa.	55	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-033	180	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	50	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
fc9ef64a-1c12-45b7-b19a-a863a6fcdbc8	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Pure Besan / Gram Flour (1kg)	Fine ground Bengal gram flour, gluten-free.	95	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-034	250	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	86	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
8df3c1ce-1ebf-4ec9-949c-f5ab2061312d	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Ragi Flour (1kg)	Finger millet flour, incredibly rich in calcium.	75	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-035	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
3f34e087-3dc3-4fe4-a028-1e56c4132b9a	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Bajra Flour / Pearl Millet (1kg)	Traditional nutrient-rich pearl millet flour.	70	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-036	120	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	63	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
f84f350b-8f3d-4504-b07c-9ab63b125920	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Sabudana Large / Tapioca Pearls (500g)	Tapioca starch pearls, essential for fasts/Khichdi.	75	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-038	140	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
5658db2a-2bf9-4a3c-a8cf-f5c5c4a7ffd6	303063e3-82e1-4cc4-b58c-b7801b54c2e3	California Almonds Premium (500g)	Crunchy, sweet, and rich California almonds.	480	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-041	150	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	432	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
131c8616-1b72-414a-b063-4b73ab85c6fe	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cashew Nuts W240 (500g)	Large, premium grade whole cashew nuts.	520	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-042	130	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	468	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
1f53f4f2-3932-4364-b0dc-66d3d3cdce76	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Salted & Roasted Pistachios (250g)	Premium roasted pistachios in shell, lightly salted.	299	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-043	95	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	269	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
4dc63ebd-c3a5-4551-8907-df311e48a1ee	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Chilean Walnut Halves (250g)	Rich, buttery Chilean light walnut kernels.	340	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-044	80	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	306	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
62ebad7a-757e-42c9-8853-6351297fdd7b	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Soft Dried Figs / Anjeer (250g)	Sweet, fibrous round dried figs.	320	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-045	70	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	288	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
501e0077-67b0-4ec7-8913-6c79c93a2cba	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Golden Seedless Raisins (250g)	Sweet, plump green raisins dried naturally.	99	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-046	140	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	89	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
f4545561-fd44-42cd-bb0b-71b3de9f3223	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Kimia Dates (500g)	Soft, melt-in-mouth dark black Iranian dates.	280	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-047	110	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	252	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
d819f091-6272-4e85-b60d-2e0a255e05c9	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Dried Turkish Apricots (250g)	Delectable, tangy orange dried whole apricots.	220	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-048	65	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	198	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
8f89ac12-57bd-4a1b-84e2-110d3fe77d18	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Chia Seeds (150g)	Antioxidant and omega-3 rich healthy seeds.	90	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-049	120	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
680baee8-4210-40d2-af6d-4ecc6b669a2f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Flax Seeds (150g)	Nutty seeds packed with dietary fiber.	60	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-050	130	t	f	2026-05-26 13:19:27.055+05:30	2026-05-26 13:19:27.055+05:30	54	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
eb2bfb46-a842-4e60-b506-6e5c9b443234	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Wheat Dalia / Broken Wheat (500g)	Fiber-rich broken wheat for healthy porridge.	45	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SHC-FLR-039	160	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.146+05:30	41	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
f2dc4ac4-e21a-4a75-99fc-f03ea724bb0a	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Traditional Basmati Rice (5kg)	Extra long grain, highly fragrant aged basmati rice.	720	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	SHC-FLR-040	100	t	f	2026-05-26 13:19:27.055+05:30	2026-06-01 23:22:03.146+05:30	648	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N	{}
4fabdc76-4489-4975-a4c5-9d7cc73d98f3	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Paneer / Cottage Cheese (200g)	Soft, fresh, and creamy cottage cheese block.	90	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	DNS-DY-001	120	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.146+05:30	81	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
a44496b2-81ec-4c10-bdc1-8e6c0b8898ad	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Salted Butter (500g)	Classic, delicious salted cream butter.	275	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	DNS-DY-002	150	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.147+05:30	248	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
2d028ce2-8889-4a25-8744-9d688d346424	15b0d44c-efc7-4255-a6df-6ee823d86292	Processed Cheese Slices (200g)	10 individually wrapped creamy cheese slices.	150	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-003	95	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	135	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
ef7432eb-64ec-4ca3-9570-ba337e804197	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Cream (250ml Pack)	Low fat, smooth dairy fresh cream.	70	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-009	110	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	63	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
bd4524fe-1b67-4a17-aba5-46dc928adf6c	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Mozzarella Shredded (150g)	Perfect melting shredded cheese for pizzas.	180	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-010	65	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	162	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
749a2632-a6fc-4222-9969-7e92836847b8	15b0d44c-efc7-4255-a6df-6ee823d86292	Coca Cola Original (750ml)	Refreshing, sparkling carbonated soft drink.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-011	300	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
ffc0daf7-a255-4717-aa32-4d004926343d	15b0d44c-efc7-4255-a6df-6ee823d86292	Sprite Lemon Lime (750ml)	Crisp, refreshing lemon-lime flavored soda.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-012	280	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
dbeea540-c02e-4e59-83d6-c1c91633d991	15b0d44c-efc7-4255-a6df-6ee823d86292	Thums Up Strong Soda (750ml)	Strong, spicy, high-fizz cola drink.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-013	350	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
1bb8578f-3c69-4f40-a6b0-04fef3b38872	15b0d44c-efc7-4255-a6df-6ee823d86292	Diet Coke Zero Sugar (300ml Can)	Sugar-free, calorie-free refreshing diet cola.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-014	150	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	36	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
de1e1f68-17d7-42a7-9618-4ecb3bc35d83	15b0d44c-efc7-4255-a6df-6ee823d86292	Schweppes Tonic Water (300ml)	Classic carbonated mixer with quinine.	60	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-015	120	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	54	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
eefe0cf3-bae6-4c0a-bb83-deadaa014abb	15b0d44c-efc7-4255-a6df-6ee823d86292	Schweppes Ginger Ale (300ml)	Bubbling, crisp ginger flavored soda.	60	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-016	120	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	54	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
b8d74695-fa21-4c3e-8db2-2407a870f3f3	15b0d44c-efc7-4255-a6df-6ee823d86292	Real Tender Coconut Water (200ml)	Pure, refreshing coconut water in a brick pack.	45	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-020	220	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	41	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
5f2d8c92-1ca1-4c90-a176-2c18faea5817	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Unsalted Cooking Butter (100g)	Pure, unsalted butter ideal for baking.	60	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	DNS-DY-005	80	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.148+05:30	54	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
42e7ce53-bd2f-4ee9-9270-a5ce1d7ec0f0	15b0d44c-efc7-4255-a6df-6ee823d86292	Farm-Fresh Brown Eggs (12 Pcs)	Premium, protein-rich large brown chicken eggs.	160	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	DNS-DY-006	100	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.148+05:30	144	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	egg	f	15	[]	\N	\N	{}
316a3d41-6853-4aaf-9e1e-5331aae06985	15b0d44c-efc7-4255-a6df-6ee823d86292	Sweet Mango Lassi (250ml Tetrapak)	Refreshing yogurt drink blended with mango pulp.	30	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	DNS-DY-007	250	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.149+05:30	27	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
5ca9e98d-881e-4edb-a167-16e1e34190ed	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Chocolate Milk (180ml)	Thick, delicious chocolate flavored milk shake.	35	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	DNS-DY-008	200	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.149+05:30	32	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
abac7d0e-1ca0-4c71-8e89-01373c9a521c	15b0d44c-efc7-4255-a6df-6ee823d86292	Nescafe Gold Instant Coffee (100g)	Rich, smooth roasted premium instant coffee.	350	INR	["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"]	DNS-BEV-017	85	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.149+05:30	315	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
31ed7816-d340-4297-af39-e191aa033672	15b0d44c-efc7-4255-a6df-6ee823d86292	Taj Mahal Assam Tea (500g)	Premium loose leaf black tea from Assam.	290	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	DNS-BEV-018	140	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.149+05:30	261	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
508ebc1f-bae6-475d-9127-5ad374e00abc	15b0d44c-efc7-4255-a6df-6ee823d86292	Premium Sandwich White Bread (400g)	Soft, sliced fresh white sandwich bread.	45	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	DNS-BAK-021	150	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.15+05:30	41	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
17b0d234-314e-4359-848f-7e4aa3b75620	15b0d44c-efc7-4255-a6df-6ee823d86292	100% Whole Wheat Brown Bread (400g)	Fiber-rich, healthy sliced wheat brown bread.	55	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	DNS-BAK-022	120	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.151+05:30	50	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
edbf5a3d-da8a-40c6-b48e-dbd0b7899a5d	15b0d44c-efc7-4255-a6df-6ee823d86292	Multigrain Artisan Bread (400g)	Soft bread topped with oats, flax, and sesame seeds.	65	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	DNS-BAK-023	80	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.151+05:30	59	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
05fc68ff-bcce-47a5-89bc-61eeb830681d	15b0d44c-efc7-4255-a6df-6ee823d86292	Chocolate Chip Cookies (150g Pack)	Crunchy cookies loaded with rich chocolate chips.	70	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-025	180	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	63	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
a2c62ea9-6d48-44d8-843b-8ae04193a929	15b0d44c-efc7-4255-a6df-6ee823d86292	Britannia Digestive Biscuits (250g)	High-fiber, crispy whole wheat biscuits.	60	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-026	250	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	54	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
013185ac-09bb-486b-9854-eb59a9691953	15b0d44c-efc7-4255-a6df-6ee823d86292	Kelloggs Corn Flakes Original (875g)	Crunchy, toasted flakes of golden corn breakfast cereal.	299	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-027	90	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	269	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
f49adfcd-37c0-4d6a-b542-644cec147c0b	15b0d44c-efc7-4255-a6df-6ee823d86292	Kelloggs Chocos Cereal (375g)	Chocolatey, scoop-shaped crunchy wheat cereal.	180	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-028	110	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	162	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
6f8f877a-72e5-472c-b49d-a226b9d3b1fb	15b0d44c-efc7-4255-a6df-6ee823d86292	Quaker Rolled Oats (1kg)	100% natural whole grain rolled oats.	199	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-029	130	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	179	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
57cf3687-feb8-4ee4-8087-636291daf452	15b0d44c-efc7-4255-a6df-6ee823d86292	Kissan Mixed Fruit Jam (500g Jar)	Sweet spread made with 8 real fruits pulp.	170	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-030	140	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	153	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
7e189815-45d3-47e6-be98-2474afd50a20	15b0d44c-efc7-4255-a6df-6ee823d86292	Maggi 2-Min Masala Noodles (Pack of 6)	Instant noodles with authentic Indian masala spices.	96	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-032	350	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	86	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
d20757e9-87b0-4ce4-bb2c-d5fb8e6f13f9	15b0d44c-efc7-4255-a6df-6ee823d86292	Ching's Schezwan Chutney (250g)	Fiery, garlic-rich schezwan dipping sauce.	85	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-034	180	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	77	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
be412874-757e-4748-81a8-72bb61157b35	15b0d44c-efc7-4255-a6df-6ee823d86292	Haldirams Roasted Peanut Salted (200g)	Crunchy, roasted split peanuts, lightly salted.	50	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-035	240	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	45	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
65cdc0b2-1b57-4968-98fc-afc9dfafdffd	15b0d44c-efc7-4255-a6df-6ee823d86292	Real Mixed Fruit Juice (1L)	Pure, refreshing liquid fruit blend.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-037	160	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	99	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
f4178692-4aad-490e-8901-5d3babc1a67a	15b0d44c-efc7-4255-a6df-6ee823d86292	Haldiram Bhujia Sev (350g)	Crispy, spicy moth bean flour noodles.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-038	220	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	99	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
a83660a9-724a-458a-b7d0-dd8db5de1178	15b0d44c-efc7-4255-a6df-6ee823d86292	Dettol Liquid Hand Wash (200ml)	Antibacterial liquid soap, original pine scent.	99	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-039	200	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	89	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
6822461f-0314-4f65-8255-0681d9ea671f	15b0d44c-efc7-4255-a6df-6ee823d86292	Vim Dishwashing Gel Lemon (500ml)	Concentrated gel, cuts grease with power of lemons.	120	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-040	180	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	108	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
f0c1a5c2-45b0-4ef7-b099-8cdfc5d0c3d9	15b0d44c-efc7-4255-a6df-6ee823d86292	Lizol Floor Cleaner Citrus (1L)	Disinfectant surface cleaner, citrus fragrance.	185	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-042	160	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	167	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
6b3c92ed-4b43-44b9-9da4-9830a14e769c	15b0d44c-efc7-4255-a6df-6ee823d86292	Colin Glass & Multi-Surface Spray (500ml)	Shine booster glass and household spray.	105	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-043	130	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	95	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
ca9e44eb-a83a-42f1-bb8b-3259d625aa9b	15b0d44c-efc7-4255-a6df-6ee823d86292	OXO Oxodegradable Garbage Bags (30 Pcs)	Medium size black, biodegradable garbage bags.	90	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-044	220	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	81	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
a40c14bf-5f6a-4a18-92c0-2d5232c7d696	15b0d44c-efc7-4255-a6df-6ee823d86292	Lays Potato Chips Classic (50g)	Crisp, salted potato chips.	20	INR	["https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop"]	DNS-SNC-031	400	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.152+05:30	18	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
f9edf40b-779b-464e-a500-437d298e4434	15b0d44c-efc7-4255-a6df-6ee823d86292	Maggi Hot & Sweet Tomato Sauce (1kg)	Tangy, sweet and spicy tomato ketchup.	160	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	DNS-SNC-033	110	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.152+05:30	144	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
f21fd6e0-4bfd-4c85-9edc-5f23954778c0	15b0d44c-efc7-4255-a6df-6ee823d86292	Act II Popcorn Butter Pepper (3 Pcs)	Instant microwave popcorn, butter pepper flavor.	60	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	DNS-SNC-036	300	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.153+05:30	54	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
8295e69c-36af-4494-bec1-ff15af603580	15b0d44c-efc7-4255-a6df-6ee823d86292	Harpic Toilet Cleaner Liquid (1L)	Disinfectant toilet bowl cleaner, fresh scent.	195	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	DNS-HOM-041	150	t	f	2026-05-26 13:19:27.064+05:30	2026-06-01 23:22:03.153+05:30	176	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
4b160cc3-95b0-42e5-9a60-801829ba8269	15b0d44c-efc7-4255-a6df-6ee823d86292	Origami Soft Face Tissues (200 Pulls)	2-ply super soft facial tissue box.	80	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-045	240	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	72	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
ac7d4b96-7898-4106-b5f3-3d762426cc5e	15b0d44c-efc7-4255-a6df-6ee823d86292	Surf Excel Matic Liquid Detergent (1L)	Tough stain removing liquid for washing machines.	230	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-046	180	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	207	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
9a722f7e-808e-45c8-901b-e5e396d07920	15b0d44c-efc7-4255-a6df-6ee823d86292	Comfort Fabric Conditioner (1L)	Softens clothes, gives long lasting freshness.	210	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-047	140	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	189	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
c915e021-4937-44bd-816e-cd64ddc89c2f	15b0d44c-efc7-4255-a6df-6ee823d86292	Savlon Antiseptic Liquid (500ml)	Trusted antiseptic germicide for wound care.	160	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-048	100	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	144	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
6f097d71-b88b-4a34-91c4-954442a63954	15b0d44c-efc7-4255-a6df-6ee823d86292	Origami Kitchen Paper Towel (2 Rolls)	Absorbent, strong 2-ply kitchen paper rolls.	95	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-049	120	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	86	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
7f6c64c5-6012-4e99-a8c2-30da98597176	15b0d44c-efc7-4255-a6df-6ee823d86292	Ariel Complete Detergent Powder (1kg)	Deep cleaning laundry washing powder.	190	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-050	250	t	f	2026-05-26 13:19:27.064+05:30	2026-05-26 13:19:27.064+05:30	171	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N	{}
95fc0049-6acd-465d-9a19-8b41e3acb9e1	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Mozzarella Blocks (200g)	Coconut-oil based vegan mozzarella, melts beautifully.	320	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-006	40	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	288	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
a59026bc-f736-4674-a7e1-3922011de535	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Cheddar Shreds (200g)	Tangy, sharp plant-based cheddar cheese shreds.	340	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-007	35	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	306	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
06d0fb42-ae70-4fb5-a1bd-20b3cdfd5359	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Classic Hummus (200g)	Creamy chickpea puree with organic tahini and olive oil.	180	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-010	70	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	162	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
e56921e4-8762-4b07-ab84-c2d41c2daf34	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic White Quinoa (1kg)	Gluten-free complete protein white quinoa grains.	450	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-011	100	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	405	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
6dafb6c6-ef5c-4b8d-a309-f5072916d8f8	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Tri-Color Quinoa (500g)	Beautiful blend of white, red, and black quinoa.	290	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-012	85	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
c748dcf3-e2a2-4da4-8216-1eab392d3304	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Whole Chia Seeds (250g)	Fiber and Omega-3 rich whole chia seeds.	160	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-013	150	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	144	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
a3245f0d-db53-4135-9efe-eaa0994a59fe	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold-Milled Golden Flax Seeds (250g)	Milled golden flax seeds, ready to mix in smoothies.	120	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-014	110	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
d5b61b91-7717-4e4f-b0f6-4a714e28f146	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Pumpkin Seeds (200g)	Shelled pepitas, rich in zinc and magnesium.	180	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-015	140	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	162	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
63bbb890-e60e-40f2-aa5c-daae9408c785	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Oat Milk Unsweetened (1L)	Dairy-free, gluten-free milk with a natural oat sweetness.	350	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	NBP-MLK-002	75	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.154+05:30	315	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
768b86af-681d-4a0a-887e-831fe259a819	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vanilla Soy Milk Organic (1L)	Organic soy milk infused with natural vanilla bean.	180	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	NBP-MLK-003	90	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.154+05:30	162	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
f0b1dcac-736e-4adb-b138-a7591310bb45	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Creamy Cashew Milk (1L)	Silky, dairy-free milk made from raw organic cashews.	380	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	NBP-MLK-005	45	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.155+05:30	342	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
0aa12913-836f-4c05-b352-cbd4e978f1c9	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Stone-Ground Smooth Almond Butter (200g)	100% roasted almonds, stone-ground with no added oils.	390	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	NBP-VEG-008	60	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.155+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
ffc6af4c-44e5-4b9f-ab00-173edf65439b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Crunchy Dark Roast Peanut Butter (350g)	Slow roasted high-protein peanut butter with chunks.	160	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	NBP-VEG-009	120	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.155+05:30	144	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
a7663633-4f4d-412c-8e25-abbced724ba2	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Roasted Sunflower Seeds (200g)	Lightly roasted, nutty sunflower seed kernels.	140	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-016	120	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	126	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
10e6033c-f5cd-46ae-8475-97a91f4c12c8	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Shelled Hemp Seeds (150g)	Superfood seeds rich in gamma-linolenic acid GLA.	390	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-017	55	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
baf36ea3-62b0-4182-bf83-2d03460480dd	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Jumbo Rolled Oats (1kg)	Thick cut, minimally processed rolled oats.	240	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-018	130	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	216	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
1a25dfe3-1568-4fc0-becf-78c9036350f5	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Steel Cut Oats (1kg)	Coarsely chopped oat groats, high fiber breakfast.	260	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-019	95	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	234	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
e1b6608b-846e-439a-8ec9-2bfd80933a96	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Buckwheat Groats (500g)	Raw, organic gluten-free buckwheat grains.	190	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-020	80	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	171	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
e38b813d-8230-4442-9940-b32e565bef2b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Spirulina Powder (100g)	Blue-green algae powder, ultimate protein superfood.	350	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-022	60	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	315	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
56e48711-feaf-4381-824f-b72a0ed0ea33	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Freeze-Dried Acai Berry (100g)	Pure Brazilian acai berry powder, antioxidant powerhouse.	990	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-023	20	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	891	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
aeedfb54-ded4-4961-8f85-73aa78f855a0	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Golden Turmeric Latte Mix (150g)	Blend of turmeric, black pepper, cinnamon, and ginger.	250	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-024	90	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	225	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
f8eed817-ab32-454e-9371-1c778efa7a1b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Dried Hibiscus Flowers (100g)	Tart, ruby-red dried calyces for herbal infusions.	190	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-027	75	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	171	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
81f3e373-5119-443d-b975-e0da171ade31	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Flour Blend (1kg)	Superb 1-to-1 substitute for baking gluten-free.	290	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-028	120	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
0f923c2f-988f-4998-afb6-6d08105ca859	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Baked Quinoa Chips Sea Salt (100g)	Crispy, protein rich quinoa chips, light and crunchy.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-029	180	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	99	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
433dfd30-9bac-45da-9dc6-56877792ec27	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Crispy Baked Beetroot Chips (80g)	Oil-free baked sweet beetroot crisps.	95	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-030	140	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	86	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
72cb3687-9042-45f8-bc54-da3aef7492d7	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Roasted Makhana Salt & Pepper (100g)	Crunchy foxnuts popped and roasted, seasoned with pepper.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-031	160	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
33a8410f-e9c7-4f19-a006-47f3c33ac35e	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Premium Dried Mixed Berries (200g)	Blend of cranberries, blueberries, cherries, and raisins.	350	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-032	110	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	315	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
7af328cd-ac3f-4c95-8295-89878d76a7d2	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Dried Goji Berries Organic (150g)	Sweet, chewy berries packed with vitamin A.	390	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-033	50	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
fb6d41d3-9370-4804-a64a-f2f183030162	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Toasted Coconut Chips (100g)	Thin coconut ribbons toasted with a pinch of sea salt.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-034	150	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
3ca6adc1-827c-4735-8576-35d569db054c	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Raw Cacao Nibs (150g)	Crunchy, unsweetened crushed organic cacao beans.	290	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-035	70	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
5b9f4c94-dfc3-4f77-b6f0-cf29134fa048	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Chamomile Herbal Tea Bags (25 Bags)	Calming, caffeine-free whole chamomile flower tea.	220	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	NBP-SUP-025	110	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.157+05:30	198	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
1a32d83f-1c08-425c-b203-849c5bbd184f	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Apple Cider Vinegar ACV Gummies (60 Pcs)	Delicious vegan ACV gummies with B-vitamins.	690	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	NBP-SNC-036	45	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.158+05:30	621	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
aa3fc7aa-c4d1-4f11-aa8c-143486453308	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold Pressed Green Juice (250ml)	Spinach, cucumber, celery, green apple, and mint.	149	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-037	50	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	134	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
2f7417aa-7b8d-4a25-a8de-f61033614df7	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold Pressed Pomegranate (250ml)	100% pure cold pressed pomegranate, no sugar added.	180	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-038	40	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	162	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
3dfb466f-9e1b-4ece-bb8a-3626bed71b82	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Beetroot Ginger Wellness Shot (100ml)	Concentrated shot of beetroot, ginger, and lemon.	90	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-039	70	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	81	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
8405b57e-3fe9-4dd4-a080-793a3639ca2b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Pure Organic Aloe Vera Juice (1L)	Cold processed inner leaf aloe juice, digestive aid.	299	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-040	65	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	269	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
9707472a-5c55-4479-b93c-48dd327da332	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Raw Kombucha Original (330ml)	Effervescent fermented black tea rich in probiotics.	160	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-041	60	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	144	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
c4e863b2-ef20-4956-8e43-72118c2ce8d5	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Ginger Lemon Probiotic Kombucha (330ml)	Fermented sparkling tea with zesty ginger and lemon.	170	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-042	55	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	153	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
5cf3f754-4d8e-4ebc-9318-5d8acd02b58a	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Organic Coconut Water (250ml)	Hydrating, single-source sweet organic coconut water.	60	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-044	150	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	54	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
9b3cfd21-4f5d-4eb1-9b54-c5769b511e01	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Maca Root Powder (100g)	Adaptogenic Peruvian maca root powder for energy.	390	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-045	40	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
185874eb-1a7e-443c-9183-a440d54f1e5b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Organic Cacao Powder (200g)	Unsweetened, cold-processed rich cacao powder.	320	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-046	85	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	288	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
1a8d84d1-844a-495d-9da8-59788406451a	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Rolled Oats (1kg)	Pure whole grain oats, certified gluten free.	280	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-047	120	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	252	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
4f4dbfc5-db63-489a-ae92-0ceab9dc4d81	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Baked Beetroot Crisps (80g)	Light, crunchy and naturally sweet beetroot chips.	95	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-048	130	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	86	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
10ac9a96-7ad5-4dec-9ca5-e85da820fcf2	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Detox Charcoal Lemonade (250ml)	Activated charcoal, lemon, agave, and alkaline water.	149	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-049	35	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	134	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
f8c662ab-d31e-4e6c-8074-ff2eee811502	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Cream Cheese Plain (200g)	Cultured cashew nut based plain cream cheese.	290	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-050	40	t	f	2026-05-26 13:19:27.075+05:30	2026-05-26 13:19:27.075+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
c2857ea1-03e7-47de-90d4-bdcfcc8bfc4f	9e788bd7-04ac-4154-af16-cb086c59b39b	Authentic Mysore Masala Dosa	Dosa smeared with signature spicy red garlic chutney, filled with potato mash and dollop of butter.	90	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	MRK-SNK-002	91	t	f	2026-05-26 13:58:14.259+05:30	2026-06-01 23:22:03.16+05:30	86	\N	\N	{"unit": "Pc"}	1f6b2343-2619-429e-b843-dfda8ed66949	veg	f	15	[]	\N	\N	{}
40cfeddb-b237-4a5e-a56f-887b7fca74cb	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Apple Cinnamon Kombucha (330ml)	Warm cider notes in a fizzy probiotic tea.	170	INR	["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=600&auto=format&fit=crop"]	NBP-JUC-043	50	t	f	2026-05-26 13:19:27.075+05:30	2026-06-01 23:22:03.158+05:30	153	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N	{}
5bd50035-eb55-406a-a456-b00a502a9429	e7d160e1-fd10-440b-a753-76aa564fee69	Fresh Nanjangud Bananas (1 Dozen)	Geographical Indication (GI) tagged sweet local bananas from Mysuru district.	80	INR	["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop"]	VOG-VEG-001	100	t	f	2026-05-26 13:58:14.265+05:30	2026-06-01 23:22:03.158+05:30	76	\N	\N	{"unit": "Pc"}	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	veg	f	15	[]	\N	\N	{}
5522266c-b4b8-4609-a348-65b2c7543b0a	e7d160e1-fd10-440b-a753-76aa564fee69	Organic Sona Masuri Rice (5kg)	Aged, lightweight and aromatic unpolished Sona Masuri rice.	320	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	VOG-VEG-002	100	t	f	2026-05-26 13:58:14.265+05:30	2026-06-01 23:22:03.159+05:30	304	\N	\N	{"unit": "kg"}	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	veg	f	15	[]	\N	\N	{}
cf20490c-6dd4-482c-ac10-61aa3db0a662	e7d160e1-fd10-440b-a753-76aa564fee69	Cold-Pressed Groundnut Oil (1L)	100% natural, wood-pressed pure groundnut oil.	210	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	VOG-OIL-003	100	t	f	2026-05-26 13:58:14.265+05:30	2026-06-01 23:22:03.159+05:30	200	\N	\N	{"unit": "L"}	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	veg	f	15	[]	\N	\N	{}
c74aed60-fe9b-4db2-94cb-63f86f6fed98	9e788bd7-04ac-4154-af16-cb086c59b39b	Kesari Bath	Sweet semolina pudding flavored with ghee, cardamom, saffron, and loaded with cashew raisins.	50	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	MRK-SNK-003	95	t	f	2026-05-26 13:58:14.259+05:30	2026-06-01 23:22:03.159+05:30	48	\N	\N	{"unit": "Pc"}	1f6b2343-2619-429e-b843-dfda8ed66949	veg	f	15	[]	\N	\N	{}
3cb06c73-18cf-4564-8997-f806020f8f4c	5c28aeb5-8ee6-40ed-8a2c-ceb3c675f79d	Royal Chamundi South Meals	Rice, Sambar, Rasam, two dry curries, papad, curd, sweet, and pickle.	150	INR	["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"]	CPV-MEAL-001	100	t	f	2026-05-26 13:58:14.27+05:30	2026-05-26 13:58:14.27+05:30	143	\N	\N	{"unit": "Pc"}	65bb875d-0496-4db0-b1fc-ea2fae0630c9	veg	f	15	[]	\N	\N	{}
46da6f3d-7f1b-4d2a-9441-aa343d82b425	c46d30f0-f03a-4d6d-947c-addafba1fc1a	Fresh Cream Bun	Sweet bun stuffed with fresh whipped cream and sugar dust.	35	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	CHB-BAK-02	100	t	f	2026-05-26 13:58:14.438+05:30	2026-05-26 13:58:14.438+05:30	33	\N	\N	{"unit": "Pc"}	19106bf7-bf42-41c0-910f-5ca7ab302313	veg	f	15	[]	\N	\N	{}
9f1a526b-7fb4-415b-a404-9281392f338e	55833a76-e476-42f9-9c73-68a3d265d6e9	Special Mysore Masala Puri	Crushed puris drowned in hot spiced peas gravy, topped with onions, sev, and coriander.	50	INR	["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"]	CCC-CHT-01	100	t	f	2026-05-26 13:58:14.442+05:30	2026-05-26 13:58:14.442+05:30	48	\N	\N	{"unit": "Pc"}	4056c17e-7978-40f9-a7cf-5254569ccbfb	veg	f	15	[]	\N	\N	{}
4070356b-619f-46e8-8525-20915e01c8ba	55833a76-e476-42f9-9c73-68a3d265d6e9	Dahi Puri Platter	Puris loaded with potato, sweet yogurt, green and sweet chutneys.	60	INR	["https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop"]	CCC-CHT-02	100	t	f	2026-05-26 13:58:14.442+05:30	2026-05-26 13:58:14.442+05:30	57	\N	\N	{"unit": "Pc"}	4056c17e-7978-40f9-a7cf-5254569ccbfb	veg	f	15	[]	\N	\N	{}
4e705c55-3be7-4271-adc2-942ab7124e66	77924119-caf8-4443-a56e-6369f8509962	Mysore Tatte Idli (1 Pc)	Large plate-sized soft idli served with butter, sambar, and chutney.	45	INR	["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"]	IMV-IDL-01	100	t	f	2026-05-26 13:58:14.445+05:30	2026-05-26 13:58:14.445+05:30	43	\N	\N	{"unit": "Pc"}	494f78a4-8b1c-451f-af8f-c41995696ae1	veg	f	15	[]	\N	\N	{}
bbd475f3-d4f5-48c0-bc68-399dc8d0ba93	fba835a6-ec67-4a36-bc85-806375752934	Crispy Veg Seekh Kebab	Mixed veg seekh kebabs grilled to perfection.	130	INR	["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop"]	BDM-KBB-02	100	t	f	2026-05-26 13:58:14.448+05:30	2026-05-26 13:58:14.448+05:30	124	\N	\N	{"unit": "Pc"}	957480f9-becd-4755-82d1-182ebd9c01e7	veg	f	15	[]	\N	\N	{}
57077693-1e01-4f71-a61c-3dafe5451f49	e7d160e1-fd10-440b-a753-76aa564fee69	Organic Country Eggs (Pack of 6)	Country chicken eggs, high protein and natural.	60	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	VOG-EGG-004	100	t	f	2026-05-26 13:58:14.265+05:30	2026-06-01 23:22:03.16+05:30	57	\N	\N	{"unit": "Pc"}	333ac7d3-45c5-4e68-b5eb-b7b5032d5d66	non-veg	f	15	[]	\N	\N	{}
8cf57bf5-1e27-49f0-9c0a-534e690535bc	5c28aeb5-8ee6-40ed-8a2c-ceb3c675f79d	Paneer Butter Masala & Roti Combo	Creamy paneer curry served with 2 hot butter tandoori rotis.	180	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	CPV-CUR-002	100	t	f	2026-05-26 13:58:14.27+05:30	2026-06-01 23:22:03.161+05:30	171	\N	\N	{"unit": "Pc"}	65bb875d-0496-4db0-b1fc-ea2fae0630c9	veg	f	15	[]	\N	\N	{}
18499909-c6bd-4e6f-b4a1-9d5a1e92b3d4	8be65832-44f1-4419-8a80-f9fb86fd2df7	Nandini GoodLife Toned Milk (1L)	UHT processed pasteurized toned milk, long shelf life.	54	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	RHS-DY-001	100	t	f	2026-05-26 13:58:14.274+05:30	2026-06-01 23:22:03.161+05:30	51	\N	\N	{"unit": "L"}	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	veg	f	15	[]	\N	\N	{}
a04acc11-db50-46a4-bbb5-02e03bce597b	8be65832-44f1-4419-8a80-f9fb86fd2df7	Fresh Sandwich Whole Wheat Bread	Freshly baked sliced whole wheat bread.	45	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop"]	RHS-BAK-002	100	t	f	2026-05-26 13:58:14.274+05:30	2026-06-01 23:22:03.161+05:30	43	\N	\N	{"unit": "Pc"}	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	veg	f	15	[]	\N	\N	{}
b9cc3445-ca85-432a-a99d-8d974400317d	8be65832-44f1-4419-8a80-f9fb86fd2df7	Mysore Pak Premium Box (250g)	Rich, crumbly and melt-in-mouth traditional sweet made of ghee, gram flour, and sugar.	120	INR	["https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop"]	RHS-SNC-003	100	t	f	2026-05-26 13:58:14.274+05:30	2026-06-01 23:22:03.161+05:30	114	\N	\N	{"unit": "g"}	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	veg	f	15	[]	\N	\N	{}
4ee3c83e-d6ff-41e6-8bca-68f2f9398d40	8be65832-44f1-4419-8a80-f9fb86fd2df7	Farm Eggs (Pack of 6)	Fresh table eggs from certified farms.	45	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	RHS-EGG-004	100	t	f	2026-05-26 13:58:14.274+05:30	2026-06-01 23:22:03.162+05:30	43	\N	\N	{"unit": "Pc"}	2db5ae3f-050b-4447-8fcd-60c2a81ab7ff	non-veg	f	15	[]	\N	\N	{}
d4b92a60-1889-4118-a1c1-799c10d54df0	c39285bd-6d90-4568-9a40-e37bcfe7c3c2	Steaming Rava Idli (2 Pcs)	Served with ghee, potato sagu, and coconut chutney.	60	INR	["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"]	MFH-SNK-02	100	t	f	2026-05-26 13:58:14.433+05:30	2026-06-01 23:22:03.162+05:30	57	\N	\N	{"unit": "Pc"}	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	veg	f	15	[]	\N	\N	{}
911bc838-8d73-4e2a-9e85-d6f1370bdd49	c46d30f0-f03a-4d6d-947c-addafba1fc1a	Honey Cake (Slice)	Soft sponge cake soaked in honey syrup, topped with jam and coconut flakes.	70	INR	["https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop"]	CHB-BAK-01	100	t	f	2026-05-26 13:58:14.438+05:30	2026-06-01 23:22:03.162+05:30	67	\N	\N	{"unit": "Pc"}	19106bf7-bf42-41c0-910f-5ca7ab302313	veg	f	15	[]	\N	\N	{}
00c272ba-1be9-4a0a-a2c2-045c60cad319	77924119-caf8-4443-a56e-6369f8509962	Spicy Ghee Podi Dosa	Crispy rice crepe sprinkled with spicy gunpowder and ghee.	95	INR	["https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop"]	IMV-DOS-02	100	t	f	2026-05-26 13:58:14.445+05:30	2026-06-01 23:22:03.163+05:30	90	\N	\N	{"unit": "Pc"}	494f78a4-8b1c-451f-af8f-c41995696ae1	veg	f	15	[]	\N	\N	{}
693048aa-0cd7-48e1-97b2-6e2db83aab35	fba835a6-ec67-4a36-bc85-806375752934	Veg Donne Biryani Special	Jeera samba rice cooked with herbs, mint, and soya chunks.	160	INR	["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop"]	BDM-BRY-01	100	t	f	2026-05-26 13:58:14.448+05:30	2026-06-01 23:22:03.163+05:30	152	\N	\N	{"unit": "Pc"}	957480f9-becd-4755-82d1-182ebd9c01e7	veg	f	15	[]	\N	\N	{}
73bfab8e-fad1-457e-9991-0967ecf086fb	48e58d00-6b11-4f7d-914f-b1227d73e2d1	Premium Toor Dal (1kg)	Unpolished, pesticide-free local yellow split pigeon peas.	170	INR	["https://images.unsplash.com/photo-1585996387063-e4070a7905f8?q=80&w=600&auto=format&fit=crop"]	SMP-GR-01	100	t	f	2026-05-26 13:58:14.451+05:30	2026-06-01 23:22:03.163+05:30	162	\N	\N	{"unit": "kg"}	5435a027-bf16-425c-af23-3f7c858cc9e0	veg	f	15	[]	\N	\N	{}
bcfeac05-c2ae-4f2d-a30a-3fe4fda8defa	48e58d00-6b11-4f7d-914f-b1227d73e2d1	Pure Cow Ghee (500ml)	Traditional aroma, clarified pure cow butter ghee.	340	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	SMP-GR-02	100	t	f	2026-05-26 13:58:14.451+05:30	2026-06-01 23:22:03.163+05:30	323	\N	\N	{"unit": "Pc"}	5435a027-bf16-425c-af23-3f7c858cc9e0	veg	f	15	[]	\N	\N	{}
435189a8-d3fc-448f-a28f-4a7290d10583	75f52ffe-d4e4-4887-9708-c4494df43d21	Fresh Mysore Beetroot (1kg)	Sweet, organic local beetroots.	60	INR	["https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop"]	VFF-VEG-01	100	t	f	2026-05-26 13:58:14.454+05:30	2026-05-26 13:58:14.454+05:30	57	\N	\N	{"unit": "kg"}	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	veg	f	15	[]	\N	\N	{}
970562f4-cf03-4349-af31-d546f45f6c48	74942c9c-bbf0-4abc-8945-3ef103631a7f	Premium Kaju Cashews (250g)	Large, clean and crunchy raw cashew nuts.	240	INR	["https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop"]	CSM-NUT-02	100	t	f	2026-05-26 13:58:14.461+05:30	2026-05-26 13:58:14.461+05:30	228	\N	\N	{"unit": "g"}	c36bc6e3-08de-42d1-b37d-ac439ec1d6c4	veg	f	15	[]	\N	\N	{}
8567801d-8308-44ce-9947-6a7dd2a32485	249b4a73-3581-4db5-8c9e-d259c38acdc8	Organic Ragi Flour (1kg)	Finely milled local finger millet flour, rich in calcium.	65	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"]	MOG-MIL-02	100	t	f	2026-05-26 13:58:14.465+05:30	2026-05-26 13:58:14.465+05:30	62	\N	\N	{"unit": "kg"}	bc349e5f-11a0-4020-9150-841d9ce04680	veg	f	15	[]	\N	\N	{}
1735bd7b-0b1a-4166-8725-eb1ceb555db9	48e58d00-6b11-4f7d-914f-b1227d73e2d1	Fresh White Eggs (Pack of 12)	Clean, graded farm-fresh white eggs.	80	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	SMP-EGG-03	100	t	f	2026-05-26 13:58:14.451+05:30	2026-06-01 23:22:03.164+05:30	76	\N	\N	{"unit": "Pc"}	5435a027-bf16-425c-af23-3f7c858cc9e0	non-veg	f	15	[]	\N	\N	{}
aa20eb33-1930-47c3-addc-188e4107e991	75f52ffe-d4e4-4887-9708-c4494df43d21	Coorg Honey Orange (1kg)	Tangy, sweet and juicy premium oranges from Coorg region.	120	INR	["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop"]	VFF-FRT-02	100	t	f	2026-05-26 13:58:14.454+05:30	2026-06-01 23:22:03.164+05:30	114	\N	\N	{"unit": "kg"}	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	veg	f	15	[]	\N	\N	{}
19872106-7069-45cf-abbf-9c424786372d	75f52ffe-d4e4-4887-9708-c4494df43d21	Farm-Fresh Organic Eggs (Pack of 6)	Fresh, organic brown eggs direct from local poultry farms.	48	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	VFF-EGG-03	100	t	f	2026-05-26 13:58:14.454+05:30	2026-06-01 23:22:03.164+05:30	46	\N	\N	{"unit": "Pc"}	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	non-veg	f	15	[]	\N	\N	{}
f7192bb1-467e-4f59-b92e-053fa6191d43	f08f0ec7-8278-457c-b3a8-0d5a983280e1	Fresh Malai Paneer (200g)	Soft, creamy paneer made from pure whole milk.	95	INR	["https://images.unsplash.com/photo-1589301773857-4183df9ba8cb?q=80&w=600&auto=format&fit=crop"]	HDG-DY-01	100	t	f	2026-05-26 13:58:14.457+05:30	2026-06-01 23:22:03.165+05:30	90	\N	\N	{"unit": "Pc"}	3a1c4e22-c740-4ea2-8ace-4308de78605d	veg	f	15	[]	\N	\N	{}
c46ba1ab-57e5-4545-83e9-95097e36c9e5	f08f0ec7-8278-457c-b3a8-0d5a983280e1	Spiced Buttermilk (200ml)	Chilled buttermilk tempered with ginger, coriander, and curry leaves.	20	INR	["https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=600&auto=format&fit=crop"]	HDG-DY-02	100	t	f	2026-05-26 13:58:14.457+05:30	2026-06-01 23:22:03.165+05:30	19	\N	\N	{"unit": "L"}	3a1c4e22-c740-4ea2-8ace-4308de78605d	veg	f	15	[]	\N	\N	{}
92aa9e2d-5f12-4645-a89f-e322abb735b6	f08f0ec7-8278-457c-b3a8-0d5a983280e1	Premium Farm Eggs (Pack of 6)	High-quality farm-fresh white eggs.	42	INR	["https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=600&auto=format&fit=crop"]	HDG-EGG-03	100	t	f	2026-05-26 13:58:14.457+05:30	2026-06-01 23:22:03.165+05:30	40	\N	\N	{"unit": "Pc"}	3a1c4e22-c740-4ea2-8ace-4308de78605d	non-veg	f	15	[]	\N	\N	{}
3be4d76d-36f5-4894-a483-03c654f33287	74942c9c-bbf0-4abc-8945-3ef103631a7f	Wagh Bakri Leaf Tea (1kg)	Strong, premium quality Assam tea leaf dust.	420	INR	["https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"]	CSM-TEA-01	100	t	f	2026-05-26 13:58:14.461+05:30	2026-06-01 23:22:03.166+05:30	399	\N	\N	{"unit": "kg"}	c36bc6e3-08de-42d1-b37d-ac439ec1d6c4	veg	f	15	[]	\N	\N	{}
f09ba3d4-3853-4b75-a367-eb23380c1a84	249b4a73-3581-4db5-8c9e-d259c38acdc8	Wood-Pressed Coconut Oil (1L)	Cold pressed, aromatic edible grade coconut oil.	260	INR	["https://images.unsplash.com/photo-1614749258814-141a23d719e7?q=80&w=600&auto=format&fit=crop"]	MOG-OIL-01	100	t	f	2026-05-26 13:58:14.465+05:30	2026-06-01 23:22:03.166+05:30	247	\N	\N	{"unit": "L"}	bc349e5f-11a0-4020-9150-841d9ce04680	veg	f	15	[]	\N	\N	{}
\.


--
-- Data for Name: QRCategories; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."QRCategories" (id, uuid, title, "integrationId", "mongoId", "createdAt", "updatedAt") FROM stdin;
5f24325a-1805-44f3-a394-c10600d3d5da	f65461f0-a3be-4795-8ff1-aeabc336efa7	Store	908fa830-7d67-4555-8d3b-a72b20636d44	\N	2026-05-16 16:04:55.404+05:30	2026-05-16 16:04:55.404+05:30
\.


--
-- Data for Name: QRCodes; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."QRCodes" (id, uuid, title, "subTitle", "categoryId", "groupId", "welcomeMessage", "welcomeMessageDocument", "qrCodeURL", "integrationId", "scanCount", "phoneBookGroups", "deletedAt", "mongoId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Reviews" (id, "userId", "integrationId", rating, "reviewText", "isPublicToContacts", "createdAt", "updatedAt") FROM stdin;
9d9823ee-5af8-4eb4-85d8-6bf67a3d817d	ee5a707f-5382-4e09-8451-9e509740cd62	908fa830-7d67-4555-8d3b-a72b20636d44	5	The food here is absolutely incredible! Highly recommend the Peri Peri Fries and the Margherita Pizza.	t	2026-05-14 14:07:56.623871+05:30	2026-05-14 14:07:56.623871+05:30
a022dd1c-7394-4bfc-9e24-e604e49be035	fcdc0b54-150c-4c6f-9b7a-9d9b467dbf72	f1665785-dab5-4a4b-a543-109b62e9af4a	5	Finally trying their legendary chocolate truffle cake! 10/10.	t	2026-05-18 20:45:48.609+05:30	2026-05-18 20:45:48.609+05:30
4466475c-a06e-446b-82cd-b285c4eedce7	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5	amazing coffee - people should try this out	t	2026-05-27 13:41:30.854+05:30	2026-05-27 13:41:30.854+05:30
5e582e17-4572-4e4f-8f24-fc8ff74b12a5	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:42.79+05:30	2026-06-01 19:43:42.79+05:30
0ab43446-c227-47be-83f0-6c84825ceaa1	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:44.938+05:30	2026-06-01 19:43:44.938+05:30
daf0c340-d4a5-442d-807c-f929d9d62c31	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:45.95+05:30	2026-06-01 19:43:45.95+05:30
3db58bbe-4a67-4b7d-96a9-ddfd9afe9dbf	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:46.486+05:30	2026-06-01 19:43:46.486+05:30
c9ca072e-741c-4648-8479-f33b9142fd84	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:46.873+05:30	2026-06-01 19:43:46.873+05:30
910f7b5e-eb57-4e23-80e5-4c2cf83fd3d8	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:47.22+05:30	2026-06-01 19:43:47.22+05:30
47bdcc4a-1041-4efe-800d-ef2d22a20630	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:47.636+05:30	2026-06-01 19:43:47.636+05:30
01ce19d7-c34a-461c-8f88-fc687927d08b	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:48.016+05:30	2026-06-01 19:43:48.016+05:30
6fadb722-7206-4c68-9f42-7fb92c5f393f	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:48.571+05:30	2026-06-01 19:43:48.571+05:30
335dbc2d-13aa-4c8e-a171-8deb5c8a0dbc	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:48.953+05:30	2026-06-01 19:43:48.953+05:30
63378fc1-6d0f-43db-abce-42ca158c8064	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:49.544+05:30	2026-06-01 19:43:49.544+05:30
16087bce-f9f9-4be4-add6-37b421d23df4	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:49.981+05:30	2026-06-01 19:43:49.981+05:30
6a9fe9fe-d159-4ce4-a928-198011584205	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:50.658+05:30	2026-06-01 19:43:50.658+05:30
7d564fba-88d6-4f8a-87ee-9cf41373351f	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:51.245+05:30	2026-06-01 19:43:51.245+05:30
0b092b09-162f-45b5-8d56-08d10453fc50	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:51.87+05:30	2026-06-01 19:43:51.87+05:30
5790c4e5-a902-41d9-b52b-e776c33efcfd	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:52.371+05:30	2026-06-01 19:43:52.371+05:30
1cc39ebd-9ba7-413e-b94f-e6a38fd0eb5b	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:53.09+05:30	2026-06-01 19:43:53.09+05:30
2d066503-c893-4650-b0e2-2074d0d44368	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:53.838+05:30	2026-06-01 19:43:53.838+05:30
2c87c6e6-457b-4411-9dd4-636008351927	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:54.323+05:30	2026-06-01 19:43:54.323+05:30
1cd39250-d8fe-450f-b659-b3de49ea853e	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:56.831+05:30	2026-06-01 19:43:56.831+05:30
cc5cd4de-5f57-4112-aafd-b9239e71d042	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:57.433+05:30	2026-06-01 19:43:57.433+05:30
ccae9039-10c0-4f44-9510-179521565935	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:57.699+05:30	2026-06-01 19:43:57.699+05:30
bfe17f5e-21ef-408f-b590-6a2d92eaca32	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:58.078+05:30	2026-06-01 19:43:58.078+05:30
785c0535-5e12-4484-972a-c0fd4ed0e0e9	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:58.502+05:30	2026-06-01 19:43:58.502+05:30
573737eb-4cbe-43d7-a912-be6cb23be3cb	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:58.786+05:30	2026-06-01 19:43:58.786+05:30
34d69d3b-e626-4c9b-8653-c25b40fecab1	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:59.09+05:30	2026-06-01 19:43:59.09+05:30
26ea27aa-9e08-4a14-a3ac-487922537e6f	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:59.341+05:30	2026-06-01 19:43:59.341+05:30
571bbe04-08b8-4e7d-849b-3231ca795bd8	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:43:59.74+05:30	2026-06-01 19:43:59.74+05:30
679d0acb-5f6c-4d70-88d2-3edfa3b78634	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:44:00.054+05:30	2026-06-01 19:44:00.054+05:30
a727e623-5ede-455d-9dd4-a23b4d32ab67	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:44:00.723+05:30	2026-06-01 19:44:00.723+05:30
d6ab0d66-728d-4264-ac94-de417af65632	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:44:03.034+05:30	2026-06-01 19:44:03.034+05:30
d6380ed7-3ebc-48c3-ac87-6a4c4f225d89	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:45:37.062+05:30	2026-06-01 19:45:37.062+05:30
a1f8ac77-22a1-4e9d-b2ca-bcb580efb48a	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:45:38.348+05:30	2026-06-01 19:45:38.348+05:30
d3de7eaa-87a3-49c9-9490-e6cc1be4dcd0	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:45:39.207+05:30	2026-06-01 19:45:39.207+05:30
ba9748ce-c2b4-405d-8bb2-5830b09d4a01	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:45:39.686+05:30	2026-06-01 19:45:39.686+05:30
2c89e9ec-68d7-4fec-84bc-d3732fa80c0e	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:46:51.513+05:30	2026-06-01 19:46:51.513+05:30
f0d57c04-9c10-45ca-accd-c8c087d3f2bc	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:46:51.548+05:30	2026-06-01 19:46:51.548+05:30
278cf4a7-5ec9-4294-ab0b-464f33c84fbc	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:46:53.599+05:30	2026-06-01 19:46:53.599+05:30
4daad996-d19d-41a5-802f-c231fe72df7f	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:46:55.013+05:30	2026-06-01 19:46:55.013+05:30
ba55a724-10bb-4bb8-9d4d-c3dea08666f9	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 19:46:56.287+05:30	2026-06-01 19:46:56.287+05:30
e0581e00-9f50-4e46-a7e2-8ce288c7e30f	0893032b-3193-47b5-a046-c0f762670f46	bc349e5f-11a0-4020-9150-841d9ce04680	5		t	2026-06-01 19:46:58.486+05:30	2026-06-01 19:46:58.486+05:30
8e2f5268-52e3-4b63-8a52-3dd9bac3ab01	0893032b-3193-47b5-a046-c0f762670f46	bc349e5f-11a0-4020-9150-841d9ce04680	5		t	2026-06-01 19:47:01.705+05:30	2026-06-01 19:47:01.705+05:30
5280be1e-994e-4f17-a403-74415cbce70f	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:47:36.462+05:30	2026-06-01 19:47:36.462+05:30
7cb903ad-9fc5-45aa-8798-0d39e61a6a1b	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:47:38.896+05:30	2026-06-01 19:47:38.896+05:30
b79af690-515e-4704-a8ff-119128e8fe12	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:47:40.341+05:30	2026-06-01 19:47:40.341+05:30
ad2b7bc4-d3f9-4a0d-bf0e-ed33b446f059	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:47:41.865+05:30	2026-06-01 19:47:41.865+05:30
5d809907-3790-4d9a-9ade-6958341d42e9	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:56:35.86+05:30	2026-06-01 19:56:35.86+05:30
c5488975-ba7b-463a-9382-e996edafcfc8	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:56:58.023+05:30	2026-06-01 19:56:58.023+05:30
6ae0f82c-2dfd-4d28-b2dc-646516fb1dff	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:56:59.189+05:30	2026-06-01 19:56:59.189+05:30
7616b0cc-8541-4430-af56-1337f976c14f	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:56:59.839+05:30	2026-06-01 19:56:59.839+05:30
c25979ac-2c9b-443e-842d-13b9edf178e8	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:10.893+05:30	2026-06-01 19:57:10.893+05:30
eb16247d-7149-47b9-ba14-c55dba5cb767	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:12.214+05:30	2026-06-01 19:57:12.214+05:30
061e6cf5-5571-4b82-99e7-c2bd51edadc9	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:12.671+05:30	2026-06-01 19:57:12.671+05:30
6e18745d-6b5c-4427-b2aa-ebc8cbd43207	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:12.879+05:30	2026-06-01 19:57:12.879+05:30
2600ac47-8b92-4a5f-9a73-d4f0e51bca68	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:13.103+05:30	2026-06-01 19:57:13.103+05:30
e0f57936-3765-492e-875b-29f8850b379e	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	5		t	2026-06-01 19:57:13.43+05:30	2026-06-01 19:57:13.43+05:30
24cf1295-53d5-4312-b719-eca42eda42f8	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5	the coffee is very good - please try it out	t	2026-06-01 20:06:35.406+05:30	2026-06-01 20:06:35.406+05:30
1561626f-49f9-425e-bf53-3de6fda96833	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:06:50.96+05:30	2026-06-01 20:06:50.96+05:30
dcc2279b-b628-470a-a7bf-d236b64b5c18	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:06:51.604+05:30	2026-06-01 20:06:51.604+05:30
14daca75-e951-4eb6-b7b3-92bf362c818c	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:06:52.19+05:30	2026-06-01 20:06:52.19+05:30
d75e951f-d122-47c2-879c-b06a6517cb98	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:30:02.248+05:30	2026-06-01 20:30:02.248+05:30
7786f05a-3baf-4b6d-9cd1-3af67d658360	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:41:20.061+05:30	2026-06-01 20:41:20.061+05:30
e9daa1b3-a1a8-4c5d-be14-2186b4ab3c4c	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-01 20:49:36.071+05:30	2026-06-01 20:49:36.071+05:30
0d6b9bf8-5363-4bad-8fde-0d792d41830e	4202016f-47fd-47e7-ace4-81c2be3d4ee6	1f6b2343-2619-429e-b843-dfda8ed66949	5	COffee is really good	t	2026-06-01 22:59:59.941+05:30	2026-06-01 22:59:59.941+05:30
7899c50c-6d05-4d82-a945-7945d9500baa	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5	the coffee is very good - you should try it	t	2026-06-01 23:06:28.16+05:30	2026-06-01 23:06:28.16+05:30
eaaeda93-8e16-4e54-91ac-c9b645c205a1	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-02 11:00:39.243+05:30	2026-06-02 11:00:39.243+05:30
df624fdb-1b21-410c-ad19-515240ee8b67	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:38:59.435+05:30	2026-06-03 12:38:59.435+05:30
45abada5-10a2-46e6-8e04-ac12259e945f	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:39:00.894+05:30	2026-06-03 12:39:00.894+05:30
0852d825-73c9-4576-83ac-c54d8e939c70	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:39:01.817+05:30	2026-06-03 12:39:01.817+05:30
473a3271-bb15-420d-9849-0530776016c3	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:39:02.577+05:30	2026-06-03 12:39:02.577+05:30
290fdb61-c43d-4a82-bde8-4900174d2e2a	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:39:03.294+05:30	2026-06-03 12:39:03.294+05:30
6dc51ba9-fdf2-43b5-bdc4-2ef2ae8dd86c	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:39:03.993+05:30	2026-06-03 12:39:03.993+05:30
a199be52-cfdf-4dc5-91d6-32c5ab162669	0893032b-3193-47b5-a046-c0f762670f46	1f6b2343-2619-429e-b843-dfda8ed66949	5		t	2026-06-03 12:40:26.328+05:30	2026-06-03 12:40:26.328+05:30
302fa6ae-d6d6-4d53-a712-ae96d3b336c7	0893032b-3193-47b5-a046-c0f762670f46	bd90fc72-bc0f-4e2c-ac59-5b1f81d94461	5	we get very good eggs here	t	2026-06-03 13:28:55.5+05:30	2026-06-03 13:28:55.5+05:30
614e8b01-e847-42fe-afe1-1fd32f7aa66c	4202016f-47fd-47e7-ace4-81c2be3d4ee6	02fbbc13-b593-4e16-ac3c-2ae4dc2844f4	5	coffee is very good - must try	t	2026-06-03 13:50:07.177+05:30	2026-06-03 13:50:07.177+05:30
\.


--
-- Data for Name: Settlements; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Settlements" (id, "integrationId", amount, currency, status, utr, "settlementDate", "payoutId", "createdAt", "updatedAt", type, metadata) FROM stdin;
87feeee0-75ac-4881-962b-c97c76afe8a4	6c858926-3ba4-4c6c-9cce-e134b4a77a20	2450.50	INR	Success	UTR887923193829	2026-05-09 10:31:13.605+05:30	\N	2026-05-10 10:31:13.605+05:30	2026-05-10 10:31:13.605+05:30	payout	{}
b5335e01-eb18-4a3b-91d4-a7c9dadc8ce7	6c858926-3ba4-4c6c-9cce-e134b4a77a20	1200.00	INR	Success	UTR228394023849	2026-05-07 10:31:13.605+05:30	\N	2026-05-10 10:31:13.605+05:30	2026-05-10 10:31:13.605+05:30	payout	{}
1eedf6a5-2df9-41c2-a7e5-45d927f9f801	6c858926-3ba4-4c6c-9cce-e134b4a77a20	560.75	INR	Pending	\N	\N	\N	2026-05-10 10:31:13.605+05:30	2026-05-10 10:31:13.605+05:30	payout	{}
\.


--
-- Data for Name: States; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."States" (id, name, "countryId", "isActive", "createdAt", "updatedAt", "sarvamApiKey", "geminiApiKey", "voiceProvider", "chatProvider") FROM stdin;
d8859326-b80b-40c8-a6f4-4810e5a02c24	Andhra Pradesh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.115+05:30	2026-05-30 12:25:20.115+05:30	\N	\N	sarvam	gemini
3dbec08b-f826-4829-9a01-7571e1ba01d1	Arunachal Pradesh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.169+05:30	2026-05-30 12:25:20.169+05:30	\N	\N	sarvam	gemini
7b8e1a3f-9e69-48a0-8ede-936577d95205	Assam	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.17+05:30	2026-05-30 12:25:20.17+05:30	\N	\N	sarvam	gemini
2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	Bihar	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.171+05:30	2026-05-30 12:25:20.171+05:30	\N	\N	sarvam	gemini
d6b4001c-b832-4907-95a2-c0c50b817961	Chhattisgarh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.172+05:30	2026-05-30 12:25:20.172+05:30	\N	\N	sarvam	gemini
e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	Goa	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.174+05:30	2026-05-30 12:25:20.174+05:30	\N	\N	sarvam	gemini
76c159fe-419f-4ed0-b09e-2ac709c52a08	Gujarat	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.175+05:30	2026-05-30 12:25:20.175+05:30	\N	\N	sarvam	gemini
3c018355-5b26-4020-8b60-dcb530df3245	Haryana	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.176+05:30	2026-05-30 12:25:20.176+05:30	\N	\N	sarvam	gemini
4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	Himachal Pradesh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.176+05:30	2026-05-30 12:25:20.176+05:30	\N	\N	sarvam	gemini
c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	Jharkhand	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.177+05:30	2026-05-30 12:25:20.177+05:30	\N	\N	sarvam	gemini
603b384d-e11e-41b0-956a-2ecbc6049839	Kerala	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.178+05:30	2026-05-30 12:25:20.178+05:30	\N	\N	sarvam	gemini
e572b3c3-d877-42c5-b966-27350b44bf98	Madhya Pradesh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.179+05:30	2026-05-30 12:25:20.179+05:30	\N	\N	sarvam	gemini
f606c192-d17b-4e0f-8a28-fc883704d92a	Maharashtra	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.179+05:30	2026-05-30 12:25:20.179+05:30	\N	\N	sarvam	gemini
bce3117e-b617-43d5-b1d9-602c5b7c7776	Manipur	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.18+05:30	2026-05-30 12:25:20.18+05:30	\N	\N	sarvam	gemini
5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	Meghalaya	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.181+05:30	2026-05-30 12:25:20.181+05:30	\N	\N	sarvam	gemini
7c253320-db48-4085-853d-b44428ff6e1f	Mizoram	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.182+05:30	2026-05-30 12:25:20.182+05:30	\N	\N	sarvam	gemini
95517351-d154-4ebd-89d6-636990a2ad78	Nagaland	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.182+05:30	2026-05-30 12:25:20.182+05:30	\N	\N	sarvam	gemini
818c7e30-31cc-4a4d-a574-aaca8e436e51	Odisha	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.183+05:30	2026-05-30 12:25:20.183+05:30	\N	\N	sarvam	gemini
1097dbae-0488-4ef1-8451-790f2edbd807	Punjab	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.183+05:30	2026-05-30 12:25:20.183+05:30	\N	\N	sarvam	gemini
0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	Rajasthan	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.184+05:30	2026-05-30 12:25:20.184+05:30	\N	\N	sarvam	gemini
2afac6cf-dfed-4710-8aee-b426d50a0fa7	Sikkim	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.184+05:30	2026-05-30 12:25:20.184+05:30	\N	\N	sarvam	gemini
6af5c023-48de-4510-83ad-1c3fa6dd1bad	Tamil Nadu	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.185+05:30	2026-05-30 12:25:20.185+05:30	\N	\N	sarvam	gemini
e595fce2-ccef-4479-b84e-dfeb1a67b631	Telangana	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.186+05:30	2026-05-30 12:25:20.186+05:30	\N	\N	sarvam	gemini
c72319eb-fc39-4e24-b753-9420b750bfcb	Tripura	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.187+05:30	2026-05-30 12:25:20.187+05:30	\N	\N	sarvam	gemini
6368b6c3-2b77-46ea-9d63-a84236ed4825	Uttar Pradesh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.187+05:30	2026-05-30 12:25:20.187+05:30	\N	\N	sarvam	gemini
9679d928-43ef-47b1-b5e1-5c0f080627bb	Uttarakhand	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.188+05:30	2026-05-30 12:25:20.188+05:30	\N	\N	sarvam	gemini
67d8ee2a-792a-43e5-bda4-28ba0c223318	West Bengal	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.188+05:30	2026-05-30 12:25:20.188+05:30	\N	\N	sarvam	gemini
58b64fbb-97b3-48bc-b414-7c113d373e3d	Chandigarh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.191+05:30	2026-05-30 12:25:20.191+05:30	\N	\N	sarvam	gemini
7ac67a66-05d1-4829-bef8-20eeabe8e777	Dadra and Nagar Haveli and Daman and Diu	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.192+05:30	2026-05-30 12:25:20.192+05:30	\N	\N	sarvam	gemini
4d5d3212-bb46-4912-9b47-c58339e33422	Delhi	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.193+05:30	2026-05-30 12:25:20.193+05:30	\N	\N	sarvam	gemini
60046d5a-c870-49ef-b256-2b5f67ff7970	Jammu and Kashmir	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.193+05:30	2026-05-30 12:25:20.193+05:30	\N	\N	sarvam	gemini
60990765-969d-4a7a-8780-619a3474f17c	Ladakh	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.194+05:30	2026-05-30 12:25:20.194+05:30	\N	\N	sarvam	gemini
ae086e68-3d45-473f-a25a-80afd9e1f564	Lakshadweep	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.195+05:30	2026-05-30 12:25:20.195+05:30	\N	\N	sarvam	gemini
fb6a643d-95f4-434c-9738-7ccc6963cdca	Puducherry	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.198+05:30	2026-05-30 12:25:20.198+05:30	\N	\N	sarvam	gemini
7a43f743-d98b-4577-ad6c-32d6587cb844	Andaman and Nicobar Islands	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 12:25:20.19+05:30	2026-06-01 22:47:50.345+05:30	\N	\N	sarvam	gemini
fb954aae-56d1-4459-8779-401dc00873ec	Karnataka	f9d4d888-8469-4c65-a253-8f9095bc2514	t	2026-05-30 11:37:02.239+05:30	2026-06-03 13:30:29.469+05:30	\N	AIzaSyAGdtvY77rDM0YcB2gWKZuF9sZjhFaybkU	sarvam	gemini
\.


--
-- Data for Name: SupportTickets; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."SupportTickets" (id, "userId", "orderId", subject, description, status, priority, attachments, "resolvedAt", "createdAt", "updatedAt", replies, category) FROM stdin;
49755509-a072-4c5f-88e3-41df56120fbe	0893032b-3193-47b5-a046-c0f762670f46	b56b0128-441d-4ae3-8910-6fd6ced800fe	someitems are missing	please resend the order	resolved	medium	[]	2026-06-01 14:45:28.82+05:30	2026-06-01 13:07:33.309+05:30	2026-06-01 14:45:28.821+05:30	[]	General
c92618f1-adae-46e7-992d-4c818f53004b	0893032b-3193-47b5-a046-c0f762670f46	\N	the paneer is missing	please check it	open	medium	[]	\N	2026-06-01 17:11:25.378+05:30	2026-06-01 17:11:25.378+05:30	[]	General
91efe49e-3237-4535-ba40-29cdba485a67	0893032b-3193-47b5-a046-c0f762670f46	0c8a2a20-291b-43f1-b7f6-4794cd5790c4	Food missing	Missing panner	resolved	medium	[]	2026-06-01 17:13:10.876+05:30	2026-06-01 17:12:19.049+05:30	2026-06-01 17:13:10.876+05:30	[{"sender": "staff", "message": "we are chking it", "timestamp": "2026-06-01T11:42:42.409Z"}, {"sender": "staff", "message": "we will send a new one - immedaitely", "timestamp": "2026-06-01T11:43:00.001Z"}]	General
efa1dc63-ef66-476d-861b-2461b859104e	0893032b-3193-47b5-a046-c0f762670f46	0c8a2a20-291b-43f1-b7f6-4794cd5790c4	missing items	no panner	resolved	medium	[]	2026-06-01 17:23:24.805+05:30	2026-06-01 17:22:40.34+05:30	2026-06-01 17:23:24.805+05:30	[{"sender": "staff", "message": "we are sorry for that - we will fix it immediately", "timestamp": "2026-06-01T11:53:07.471Z"}]	General
b7338ff6-4375-4feb-afd3-5fb4544d64ad	4202016f-47fd-47e7-ace4-81c2be3d4ee6	bb455048-19b6-4cda-8077-b0a6b9421f54	sugar is missing	sugar	resolved	medium	[]	2026-06-02 11:10:33.316+05:30	2026-06-02 11:01:58.397+05:30	2026-06-02 11:10:33.316+05:30	[{"sender": "staff", "message": "we are working on it", "timestamp": "2026-06-02T05:39:55.274Z"}]	General
3a67cd54-e920-4445-ab80-9532942e4d8b	4202016f-47fd-47e7-ace4-81c2be3d4ee6	\N	app is slow	it is very slow in our region - please fix it	resolved	medium	[]	2026-06-02 11:28:03.282+05:30	2026-06-02 11:27:20.567+05:30	2026-06-02 11:28:03.283+05:30	[{"sender": "staff", "message": "we are wokring on it", "timestamp": "2026-06-02T05:57:36.690Z"}]	General
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."SystemSettings" (id, key, value, description, "createdAt", "updatedAt") FROM stdin;
0ef1db01-f980-4104-8897-53d9c37ad970	DEFAULT_VOICE_PROVIDER	sarvam	Default AI provider for Voice/Speech features	2026-05-26 22:55:50.173+05:30	2026-05-27 09:26:50.066+05:30
318b61ea-e83e-42eb-ab2f-845984153aad	DEFAULT_TEXT_PROVIDER	gemini	Default AI provider for Text/Chat features	2026-05-26 22:55:50.171+05:30	2026-05-27 15:12:53.76+05:30
b0a67c03-fc94-4ae3-88bf-b0438e85fadb	SARVAM_API_KEY		Global Sarvam AI API Key for Vendor Chatbots	2026-06-03 13:46:59.184+05:30	2026-06-03 13:46:59.184+05:30
79f6caf3-6a44-4a18-9490-42d910551449	GEMINI_API_KEY	AIzaSyAGdtvY77rDM0YcB2gWKZuF9sZjhFaybkU	Global Gemini API Key for AI Features	2026-06-03 13:43:11.758+05:30	2026-06-03 13:46:59.204+05:30
\.


--
-- Data for Name: UserContacts; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserContacts" (id, "userId", "contactPhoneNumber", "contactName", "createdAt", "updatedAt") FROM stdin;
5e51525b-6df7-4bba-93e5-a515243a4407	0893032b-3193-47b5-a046-c0f762670f46	+919999999999	Rahul Sharma	2026-05-14 14:07:56.621322+05:30	2026-05-14 14:07:56.621322+05:30
6102d8b9-8733-41eb-a0f2-7a838c4ee999	0893032b-3193-47b5-a046-c0f762670f46	9797979797	Suresh Friend	2026-05-18 20:45:35.635+05:30	2026-05-18 20:45:35.635+05:30
fa56fb4f-a6c7-4fc1-94e5-52400c8a6f08	0893032b-3193-47b5-a046-c0f762670f46	6868686868	Rajesh Kumar	2026-05-27 13:04:43.686798+05:30	2026-05-27 13:04:43.686798+05:30
bfba1d92-6f2c-450e-908a-01e828f749e1	4202016f-47fd-47e7-ace4-81c2be3d4ee6	9898989898	Praveen Friend	2026-06-01 17:05:39.759+05:30	2026-06-01 17:05:39.759+05:30
\.


--
-- Data for Name: UserDealUsages; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserDealUsages" (id, "userId", "integrationId", "dealId", "usageCount", "createdAt", "updatedAt") FROM stdin;
074d3948-0922-4d44-93e7-8711ccbf7ccc	5c222651-acb9-46b5-8ae2-61e633a870fe	09dacbba-d0e7-4862-8a77-e8bded1ea387	b90cd7ae-c5d3-43c4-aa2c-481f0d4993f1	0	2026-05-22 21:25:52.905+05:30	2026-05-22 21:25:52.905+05:30
\.


--
-- Data for Name: UserDevices; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserDevices" (id, uuid, "userId", "fcmToken", "socketId", "isOnline", "lastOnlineAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Users" (id, "profilePictureUrl", uuid, password, "userName", "firstName", "lastName", email, "phoneNumber", cc, role, "lastLoginAt", "userVerified", otp, "otpExpiry", "fcmToken", location, city, state, "pinCode", addresses, "cdpDetails", "createdAt", "updatedAt", "mongoId", "portfolioAccess", status, "scopedCountryId", "scopedStateId", "scopedCityId") FROM stdin;
d0b83594-f364-48c9-aed6-c1cb29c4223b	\N	test-fk-user-1	\N	\N	FkUser	One	fkuser1@example.com	9999988881	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:24:56.68+05:30	2026-05-22 21:24:56.68+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
0065781d-e778-4f08-b489-c767f5986002	\N	test-fk-user-3	\N	\N	FkUser	Three	fkuser3@example.com	9999988883	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:04.232+05:30	2026-05-22 21:25:04.232+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
d462c3e1-19a8-4d37-b86f-2f7317745139	\N	test-fk-user-4	\N	\N	FkUser	Four	fkuser4@example.com	9999988884	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:11.868+05:30	2026-05-22 21:25:11.868+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
dd25f50f-808c-49f5-872d-3caed5639f69	\N	test-fk-user-5	\N	\N	FkUser	Five	fkuser5@example.com	9999988885	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:20.189+05:30	2026-05-22 21:25:20.189+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
89ad3c81-22f9-4681-be33-63354f7d3e41	\N	test-fk-user-5	\N	\N	FkUser	Five	fkuser5@example.com	9999988885	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:28.605+05:30	2026-05-22 21:25:28.605+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
81009383-fdb8-4087-9a3f-39f48116c6b5	\N	test-fk-user-5	\N	\N	FkUser	Five	fkuser5@example.com	9999988885	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:36.212+05:30	2026-05-22 21:25:36.212+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
465f014e-e8a9-4ff4-ab78-8b456df5a39f	\N	a742899f-333d-4333-86da-f6f4f6201dd3	\N	\N	\N	\N	\N	2323232323	+91	User	\N	f	839760	1778484281528	\N	\N	\N	\N	\N	[]	[]	2026-05-11 11:54:41.53+05:30	2026-05-11 11:54:41.53+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
b9443817-5090-4d74-8463-c6e800e87018	\N	721a85b6-e0fa-43f8-8921-e4ed54036f40	\N	\N	\N	\N	\N	4343434343	+91	User	\N	f	411295	1778485902094	\N	\N	\N	\N	\N	[]	[]	2026-05-11 11:56:22.421+05:30	2026-05-11 12:21:42.094+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
25b35a14-362c-4506-8867-81264c9970b1	\N	test-fk-user-6	\N	\N	FkUser	Six	fkuser6@example.com	9999988886	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:45.515+05:30	2026-05-22 21:25:45.515+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
8781fcc7-3f43-4fae-91e6-5aed25f067b6	\N	cf8771bd-cdfa-4ebc-93b7-f1ac6eb2f9de	\N	\N	\N	\N	\N	8989898898	+91	User	1778610075434	t	000000	1778613672964	\N	\N	\N	\N	\N	[]	[]	2026-05-12 23:51:12.965+05:30	2026-05-12 23:51:15.434+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
fcdc0b54-150c-4c6f-9b7a-9d9b467dbf72	\N	uuid_suresh_friend	hashed_password	\N	Suresh	Friend	suresh@example.com	9797979797	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-18 20:45:35.599+05:30	2026-05-18 20:45:35.599+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
5c222651-acb9-46b5-8ae2-61e633a870fe	\N	test-fk-user-6	\N	\N	FkUser	Six	fkuser6@example.com	9999988886	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:25:52.901+05:30	2026-05-22 21:25:52.901+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
e4791d20-e5a6-4f07-87c8-8989898989ab	\N	uuid-8989898989	\N	\N	Test	Shopper	shopper@test.com	8989898989	+91	User	1778477827703	t	000000	1778825097695	\N	\N	\N	\N	\N	[]	[]	2026-05-10 15:41:39.547891+05:30	2026-05-15 10:34:57.695+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
74dec866-c1c2-4416-af57-c34074016509	\N	test-user-uuid-1234	\N	\N	DeleteTest	\N	\N	7777777777	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:55:37.819+05:30	2026-05-22 21:55:37.819+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
bb5be236-04ec-4473-8024-e6d47c476467	\N	aed0100c-805b-42b9-bfb4-1a58f0566ea6	\N	\N	\N	\N	\N	9900000405	+91	merchant_admin	1780467986619	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-05-24 15:10:32.728+05:30	2026-06-03 11:56:26.619+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
494b0e95-1711-4602-ae07-1eaca76d7f89	\N	test-user-uuid-1234	\N	\N	DeleteTest	\N	\N	7777777777	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:55:49.375+05:30	2026-05-22 21:55:49.375+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
63397a07-242d-43f4-ab0d-968506962117	\N	test-user-uuid-1234	\N	\N	DeleteTest	\N	\N	7777777777	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:55:57.686+05:30	2026-05-22 21:55:57.686+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
c1462be7-7729-4808-ac46-4b293b70b210	\N	test-user-uuid-1234	\N	\N	DeleteTest	\N	\N	7777777777	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:56:05.785+05:30	2026-05-22 21:56:05.785+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
ee5a707f-5382-4e09-8451-9e509740cd62	\N	40373926-aab8-43a7-9117-8fad42756983	\N	\N	Rahul	Sharma	\N	+919999999999	+91	SuperAdmin	\N	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-05-09 15:34:03.95039+05:30	2026-05-18 17:46:20.993+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
1d074097-3654-4855-8926-072c85fdb80e	\N	452bd1e4-ac1e-4381-a02d-2ce59a7adffc	\N	\N	\N	\N	\N	9900000402	+91	merchant_admin	1779615037764	t	297078	1779618580004	\N	\N	\N	\N	2123	[]	[]	2026-05-24 14:59:40.005+05:30	2026-05-24 15:00:37.764+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
4f16bbce-6f5b-4af3-b67f-7ede4495e88d	\N	test-user-uuid-1234	\N	\N	DeleteTest	\N	\N	7777777777	+91	User	\N	f	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-22 21:56:13.603+05:30	2026-05-22 21:56:13.603+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
0893032b-3193-47b5-a046-c0f762670f46	\N	0a57f3b1-5e4d-461f-b4cd-8ad729d3aa95	\N	\N	Praveen	R	\N	9898989898	+91	User	1780499576638	t	000000	1778826068975	\N	\N	\N	\N	2123	[]	[]	2026-05-11 12:22:10.111+05:30	2026-06-03 20:42:56.638+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
efb318e9-cdec-423c-bb6f-e8213c38cb17	\N	9b7bae90-c449-4467-a19c-c9a570012d0d	\N	\N	\N	\N	\N	1234512345	+91	merchant_admin	1779519333351	t	000000	1778821636029	\N	\N	\N	\N	2123	[]	[]	2026-05-15 09:34:53.726253+05:30	2026-05-23 12:25:33.352+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
d269b30f-69b6-46c2-9ebe-2a1e0994257a	\N	07f13664-f112-47e9-82e6-452a0e49aef8	\N	\N	\N	\N	\N	9900000201	+91	merchant_admin	1780468066816	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-05-25 17:35:27.866+05:30	2026-06-03 11:57:46.817+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
4dd14875-a33b-4a43-be2f-f09af11881a0	\N	998d1137-0770-4736-afb5-a874b80e1978	\N	\N	\N	\N	\N	9999999999	+91	merchant_admin	1780474476634	t	\N	\N	\N	\N	\N	\N	1234	[]	[]	2026-05-15 10:50:28.497+05:30	2026-06-03 13:44:36.635+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
98a0d838-e3ea-46f3-9ae8-3902e71f0ac5	\N	2316b639-a464-4910-b07f-2fc64acfa005	\N	\N	\N	\N	\N	1234567899	+91	User	\N	f	239706	1779870726519	\N	\N	\N	\N	\N	[]	[]	2026-05-27 13:02:06.52+05:30	2026-05-27 13:02:06.52+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
964c8fa7-d191-4ebc-adc8-9790b2b0197f	\N	c4f06a30-6059-48fc-8e0a-f5ae267e6680	\N	\N	\N	\N	\N	9844982389	+91	merchant_admin	1779856862351	t	548589	1778930149099	\N	\N	\N	\N	123456	[]	[]	2026-04-24 14:17:30.241+05:30	2026-05-27 10:11:02.351+05:30	69eb2e22ba23753ee507028e	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
40fc203b-f360-42c4-8b68-ae93c55770dd	\N	e9b32198-6907-4a42-8ce5-ef13ba8a71f5	edlcwvsbA1!	e2e_regional@tubulu.com	E2E Regional	Manager	e2e_regional@tubulu.com	9111111111	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 13:58:19.77+05:30	2026-05-30 13:58:19.77+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	\N
fe49ef39-2411-431f-bfd7-2c53e53028ff	\N	64ae94c8-3780-43d9-9d86-6bf17d106fe8	\N	\N	\N	\N	\N	1234567890	+91	User	\N	f	925561	1779870738791	\N	\N	\N	\N	\N	[]	[]	2026-05-27 13:02:18.792+05:30	2026-05-27 13:02:18.792+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
7d2b8ecb-d46a-441d-8e7f-c5473245be4e	\N	abca9e92-fb7c-42c9-8f60-05841c415317	gqfjmtzrA1!	tubuluapp@gmail.com	Pradeep 	R	tubuluapp@gmail.com	9890989098	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 13:15:38.858+05:30	2026-05-30 13:15:38.858+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	\N
4202016f-47fd-47e7-ace4-81c2be3d4ee6	\N	88ef667c-2794-4bc4-92fb-952db460ae42	\N	\N	Rajesh		\N	6868686868	+91	User	1780479356993	t	819004	1779870928145	\N	\N	\N	\N	2123	[]	[]	2026-05-27 13:04:39.576+05:30	2026-06-03 15:05:56.994+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	online	\N	\N	\N
6cfa1050-3dbd-486e-b01a-b71d6e78b4c1	\N	15e6cd35-6fb4-474b-95ab-2c971fb04935	test123	superadmin@tubulu.com	Platform	SuperAdmin	superadmin@tubulu.com	9999000000	+91	super_admin	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.428+05:30	2026-05-30 14:04:04.428+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
3a2c57f6-b4be-4321-8013-2c84bd289c2f	\N	54bb37e4-e1fd-4f52-8f54-7facbe189ca8	test123	karnataka@tubulu.com	Karnataka Regional	Manager	karnataka@tubulu.com	9500000000	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.451+05:30	2026-05-30 14:04:04.451+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	\N
1e6b360a-8e33-4f4e-acab-e194513e33fd	\N	f1e5c6fa-6fab-4cb5-943b-15df76e4641f	test123	andhrapradesh@tubulu.com	Andhra Pradesh Regional	Manager	andhrapradesh@tubulu.com	9500000001	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.454+05:30	2026-05-30 14:04:04.454+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	d8859326-b80b-40c8-a6f4-4810e5a02c24	\N
1cc38ceb-e032-4e4c-a951-720aac428e6d	\N	390af6d5-1f66-46e4-b28e-fb38a46af97a	test123	arunachalpradesh@tubulu.com	Arunachal Pradesh Regional	Manager	arunachalpradesh@tubulu.com	9500000002	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.456+05:30	2026-05-30 14:04:04.456+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	3dbec08b-f826-4829-9a01-7571e1ba01d1	\N
8dac79c1-acba-46dc-b603-56a236cf2d8d	\N	006787dd-40bc-4c5e-9f54-eb6d18970463	test123	assam@tubulu.com	Assam Regional	Manager	assam@tubulu.com	9500000003	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.457+05:30	2026-05-30 14:04:04.457+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	7b8e1a3f-9e69-48a0-8ede-936577d95205	\N
7130a587-783d-49d1-aee9-a57fdeab78c5	\N	98c1a4af-0a17-43ff-9134-ba253302f88c	test123	bihar@tubulu.com	Bihar Regional	Manager	bihar@tubulu.com	9500000004	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.459+05:30	2026-05-30 14:04:04.459+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	2e32fa40-20b7-47a6-b69b-ea73ff5f1d62	\N
6fc0f900-e7b5-478b-b6d1-ea27673787f2	\N	e6776a1c-23ba-4d1a-9bee-a06599cd5405	test123	chhattisgarh@tubulu.com	Chhattisgarh Regional	Manager	chhattisgarh@tubulu.com	9500000005	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.46+05:30	2026-05-30 14:04:04.46+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	d6b4001c-b832-4907-95a2-c0c50b817961	\N
efe2c4a3-1635-4302-aabf-b77a0d5ea3e9	\N	1dc7f3cf-f6b8-4fca-84d3-5e0cf934c6a1	test123	goa@tubulu.com	Goa Regional	Manager	goa@tubulu.com	9500000006	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.462+05:30	2026-05-30 14:04:04.462+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	e1dcbdc7-8f36-4a74-927a-3cdb16ff946e	\N
c73176a4-b288-446d-9903-a23e5c9f6912	\N	a32f1e28-bc54-466f-b080-c87d78f19134	test123	gujarat@tubulu.com	Gujarat Regional	Manager	gujarat@tubulu.com	9500000007	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.465+05:30	2026-05-30 14:04:04.465+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	76c159fe-419f-4ed0-b09e-2ac709c52a08	\N
e60d2e05-7b6e-49e7-9fb3-ac15b2804fc7	\N	1d0bda6b-532d-48b2-9400-fbdb18696dde	test123	haryana@tubulu.com	Haryana Regional	Manager	haryana@tubulu.com	9500000008	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.467+05:30	2026-05-30 14:04:04.467+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	3c018355-5b26-4020-8b60-dcb530df3245	\N
5906631c-83a7-493c-be7b-8f41a27930c3	\N	8e02335d-f657-4048-ac1e-c3f906f4620b	test123	himachalpradesh@tubulu.com	Himachal Pradesh Regional	Manager	himachalpradesh@tubulu.com	9500000009	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.468+05:30	2026-05-30 14:04:04.468+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	4bd2b22a-ec7d-44cb-9f6a-9cb15c362928	\N
4adf4d1d-0042-4d00-b3c4-c3dafcfeaf40	\N	3a4a15a2-e78e-4eaf-8d53-e03953405685	test123	jharkhand@tubulu.com	Jharkhand Regional	Manager	jharkhand@tubulu.com	9500000010	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.47+05:30	2026-05-30 14:04:04.47+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	c0ed6a8f-9f9a-47e8-9890-d917cb1cebf4	\N
16c37f19-c5f5-4d34-a0a1-aaba75cff062	\N	b37a8270-a2af-4321-9f7d-9f84d718e83c	test123	kerala@tubulu.com	Kerala Regional	Manager	kerala@tubulu.com	9500000011	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.472+05:30	2026-05-30 14:04:04.472+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	603b384d-e11e-41b0-956a-2ecbc6049839	\N
dd988283-0550-437c-bdc7-1b90945a4dda	\N	e9354254-ee7f-4992-8f3c-7871ddf0b6c4	test123	madhyapradesh@tubulu.com	Madhya Pradesh Regional	Manager	madhyapradesh@tubulu.com	9500000012	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.473+05:30	2026-05-30 14:04:04.473+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	e572b3c3-d877-42c5-b966-27350b44bf98	\N
347ca3e1-9b39-4c67-bfc3-4f27fd2133a4	\N	cabbb40e-3505-4bf5-acaa-5ff264d598cb	test123	maharashtra@tubulu.com	Maharashtra Regional	Manager	maharashtra@tubulu.com	9500000013	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.475+05:30	2026-05-30 14:04:04.475+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	f606c192-d17b-4e0f-8a28-fc883704d92a	\N
5f61430f-6a92-4945-ba08-2076b9834844	\N	7a82460f-8190-4016-bc18-88a403ba3f5d	test123	manipur@tubulu.com	Manipur Regional	Manager	manipur@tubulu.com	9500000014	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.476+05:30	2026-05-30 14:04:04.476+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	bce3117e-b617-43d5-b1d9-602c5b7c7776	\N
efd18955-a30c-48b8-a6ef-5bcad84ae59a	\N	16d586dd-f2df-4457-bb78-d6b3a5dcfbd9	test123	meghalaya@tubulu.com	Meghalaya Regional	Manager	meghalaya@tubulu.com	9500000015	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.478+05:30	2026-05-30 14:04:04.478+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	5be4a5c0-e981-4bcc-9f82-1aa5c81abeef	\N
eff65807-bed0-4c85-9a18-57477025f158	\N	2abf2594-b068-45c4-ba95-090d6d6e6214	test123	mizoram@tubulu.com	Mizoram Regional	Manager	mizoram@tubulu.com	9500000016	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.479+05:30	2026-05-30 14:04:04.479+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	7c253320-db48-4085-853d-b44428ff6e1f	\N
b005957b-407a-4fb2-a461-565e01dd28fe	\N	45fa6410-6b15-49ff-ba22-465e43d764a4	test123	nagaland@tubulu.com	Nagaland Regional	Manager	nagaland@tubulu.com	9500000017	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.481+05:30	2026-05-30 14:04:04.481+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	95517351-d154-4ebd-89d6-636990a2ad78	\N
07ea99e1-f241-472a-96d3-c5bde04d868e	\N	c543f54a-a040-439b-80c3-e228280c9312	test123	odisha@tubulu.com	Odisha Regional	Manager	odisha@tubulu.com	9500000018	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.484+05:30	2026-05-30 14:04:04.484+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	818c7e30-31cc-4a4d-a574-aaca8e436e51	\N
2136817e-de67-4d82-9b3f-d4c7319422a2	\N	36470036-53c5-48d3-8a23-997497c8b846	test123	punjab@tubulu.com	Punjab Regional	Manager	punjab@tubulu.com	9500000019	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.485+05:30	2026-05-30 14:04:04.485+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	1097dbae-0488-4ef1-8451-790f2edbd807	\N
a8c332b8-f563-4ec5-a94d-1ee235e34fc6	\N	76b2aacf-3a41-48ee-80b3-c4016d5d5be4	test123	rajasthan@tubulu.com	Rajasthan Regional	Manager	rajasthan@tubulu.com	9500000020	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.486+05:30	2026-05-30 14:04:04.486+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	0dbbc476-c61a-4ecf-8bfc-8a308bf8cc81	\N
ee725ceb-24e9-4fc1-a30f-272fe0c140ba	\N	ed3c937d-c250-4975-8a50-87ee11d32ab4	test123	sikkim@tubulu.com	Sikkim Regional	Manager	sikkim@tubulu.com	9500000021	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.487+05:30	2026-05-30 14:04:04.487+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	2afac6cf-dfed-4710-8aee-b426d50a0fa7	\N
8464b803-2c81-4a8f-86da-8f8a53a0895d	\N	18684411-51dd-411b-8ba9-328646153da6	test123	tamilnadu@tubulu.com	Tamil Nadu Regional	Manager	tamilnadu@tubulu.com	9500000022	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.489+05:30	2026-05-30 14:04:04.489+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	6af5c023-48de-4510-83ad-1c3fa6dd1bad	\N
f604b014-4e1b-4acf-97b8-f14d482f9d0f	\N	a5a62981-3748-424d-b8b1-ec2d1a608440	test123	telangana@tubulu.com	Telangana Regional	Manager	telangana@tubulu.com	9500000023	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.49+05:30	2026-05-30 14:04:04.49+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	e595fce2-ccef-4479-b84e-dfeb1a67b631	\N
dffb775e-b640-409d-89e0-068d07794a25	\N	e8a2bb3a-f743-42b2-8f77-bda6bdf3b008	test123	tripura@tubulu.com	Tripura Regional	Manager	tripura@tubulu.com	9500000024	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.492+05:30	2026-05-30 14:04:04.492+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	c72319eb-fc39-4e24-b753-9420b750bfcb	\N
b2887e64-c040-4346-915e-345719229ada	\N	fa659c06-2231-4c9d-a1d4-c0a650f87105	test123	uttarpradesh@tubulu.com	Uttar Pradesh Regional	Manager	uttarpradesh@tubulu.com	9500000025	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.493+05:30	2026-05-30 14:04:04.493+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	6368b6c3-2b77-46ea-9d63-a84236ed4825	\N
72eaaea5-a77e-42ea-9ee0-4bd462dcf26d	\N	4139488e-7343-4f25-9fb8-6888c0e5f1ed	test123	uttarakhand@tubulu.com	Uttarakhand Regional	Manager	uttarakhand@tubulu.com	9500000026	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.495+05:30	2026-05-30 14:04:04.495+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	9679d928-43ef-47b1-b5e1-5c0f080627bb	\N
5a5b5525-fc8b-43a0-9d16-a37081d14c69	\N	d668da58-dc64-4971-9af8-fb82ced773d5	test123	westbengal@tubulu.com	West Bengal Regional	Manager	westbengal@tubulu.com	9500000027	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.496+05:30	2026-05-30 14:04:04.496+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	67d8ee2a-792a-43e5-bda4-28ba0c223318	\N
3f1a74de-1ba9-401c-b825-8c41b11e8a18	\N	54a5962d-5144-447f-b03a-c76b7408254c	test123	andamanandnicobarislands@tubulu.com	Andaman and Nicobar Islands Regional	Manager	andamanandnicobarislands@tubulu.com	9500000028	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.497+05:30	2026-05-30 14:04:04.497+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	7a43f743-d98b-4577-ad6c-32d6587cb844	\N
5c1a0c5a-6133-4897-852f-0b47690459d9	\N	756f2950-a82d-40f9-a9fa-bc7fec8d42a0	test123	chandigarh@tubulu.com	Chandigarh Regional	Manager	chandigarh@tubulu.com	9500000029	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.499+05:30	2026-05-30 14:04:04.499+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	58b64fbb-97b3-48bc-b414-7c113d373e3d	\N
0f74f020-d534-4e2f-8e03-68144bc90e8e	\N	a27ea1af-c8a2-48fb-ac50-7154b4b358f5	test123	dadraandnagarhavelianddamananddiu@tubulu.com	Dadra and Nagar Haveli and Daman and Diu Regional	Manager	dadraandnagarhavelianddamananddiu@tubulu.com	9500000030	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.5+05:30	2026-05-30 14:04:04.5+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	7ac67a66-05d1-4829-bef8-20eeabe8e777	\N
40f01772-625a-412d-b51e-ca38b6deb8cd	\N	6e977d0d-217b-4ddd-95af-c98ff9460a4e	test123	delhi@tubulu.com	Delhi Regional	Manager	delhi@tubulu.com	9500000031	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.502+05:30	2026-05-30 14:04:04.502+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	4d5d3212-bb46-4912-9b47-c58339e33422	\N
861427cb-7a4f-4dd2-a768-261fd493ab0d	\N	3e0fade4-e8a5-4209-8126-edc1e9130791	test123	jammuandkashmir@tubulu.com	Jammu and Kashmir Regional	Manager	jammuandkashmir@tubulu.com	9500000032	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.503+05:30	2026-05-30 14:04:04.503+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	60046d5a-c870-49ef-b256-2b5f67ff7970	\N
da4e81c6-10bb-483b-a2b1-a7c9ead778c0	\N	856f7101-0baa-4a72-a167-3939579de415	test123	ladakh@tubulu.com	Ladakh Regional	Manager	ladakh@tubulu.com	9500000033	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.504+05:30	2026-05-30 14:04:04.504+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	60990765-969d-4a7a-8780-619a3474f17c	\N
ea3d4b88-8da6-47a1-a8dd-72c168b3b66f	\N	689737b6-a728-498a-8d20-b94fa46dcfe9	test123	lakshadweep@tubulu.com	Lakshadweep Regional	Manager	lakshadweep@tubulu.com	9500000034	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.505+05:30	2026-05-30 14:04:04.505+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	ae086e68-3d45-473f-a25a-80afd9e1f564	\N
66e563c7-3fc8-433a-adf2-85c9025d47c3	\N	d2da53c7-40de-4847-8694-1e8e6631e0d0	test123	puducherry@tubulu.com	Puducherry Regional	Manager	puducherry@tubulu.com	9500000035	+91	regional_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.506+05:30	2026-05-30 14:04:04.506+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb6a643d-95f4-434c-9738-7ccc6963cdca	\N
423ca58f-8792-46ff-9abf-bbd3eed98571	\N	6de2d53d-95b5-4208-9eb4-fefbce6d2b56	test123	mysuru@tubulu.com	Mysuru City	Manager	mysuru@tubulu.com	8500000000	+91	city_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.507+05:30	2026-05-30 14:04:04.507+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	eb927813-debb-43fa-8dc1-fb339882b72d
5ac1849d-c049-4173-b511-d6d51f36ee59	\N	b117ace3-09c8-4fcd-82b0-318972f977d5	test123	bengaluru@tubulu.com	Bengaluru City	Manager	bengaluru@tubulu.com	8500000001	+91	city_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-30 14:04:04.509+05:30	2026-05-30 14:04:04.509+05:30	\N	{"merchants": [], "accessType": "GLOBAL"}	offline	f9d4d888-8469-4c65-a253-8f9095bc2514	fb954aae-56d1-4459-8779-401dc00873ec	c58d308a-d23a-447f-9f14-ccd07c6be0a8
8bee6cc4-e9d6-4ad1-9c37-31b0e9967da2	\N	640b8bff-972b-4660-a00e-210716e02122	\N	\N	\N	\N	\N	6886868686	+91	User	\N	f	779327	1780310460137	\N	\N	\N	\N	\N	[]	[]	2026-06-01 15:11:00.138+05:30	2026-06-01 15:11:00.138+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
4163a2a8-3026-4dde-866a-f184fd53bbe9	\N	e162a23a-ba18-4589-96f4-d1b536c78e50	\N	\N	\N	\N	\N	9991112222	+91	merchant_admin	1780333898591	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-01 21:06:56.774+05:30	2026-06-01 22:41:38.591+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
225a70e6-c0f7-45d2-813e-6ca1bc75b687	\N	d3090f05-d751-49b4-b5e4-59bc6db1cdba	\N	\N	\N	\N	\N	9900000205	+91	merchant_admin	1780377050672	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 10:40:47.876+05:30	2026-06-02 10:40:50.672+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
88f4e67a-140b-4094-b409-b37998d3fc67	\N	eee2b18c-6ccf-4b10-a1c3-85e4503a58b1	2123	ops@tubulu.com	Operations	Manager	ops@tubulu.com	9999900000	+91	ops_manager	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-06-02 11:15:01+05:30	2026-06-02 11:15:01+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
9b1e93be-9654-4c7e-8009-ebf441bdf1c5	\N	6754f749-b99e-403a-8c5a-2cbf0809168d	\N	\N	\N	\N	\N	9879879870	+91	merchant_admin	1780410973419	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 20:06:11.545+05:30	2026-06-02 20:06:13.419+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
7d293311-5370-48e1-9487-5985d6f6679c	\N	6503d4c0-9a82-48df-8934-4e1e11c011b5	\N	\N	\N	\N	\N	9879870987	+91	merchant_admin	1780411539625	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 20:15:36.472+05:30	2026-06-02 20:15:39.625+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
3ba03e33-4d8e-4d92-9fdf-2a53a6a53ad6	\N	1186fd81-10aa-4dc1-9304-00013e16ee31	\N	\N	\N	\N	\N	9809809809	+91	merchant_admin	1780412723580	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 20:35:21.568+05:30	2026-06-02 20:35:23.582+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
9fae5ae6-22c0-4809-b642-f63d6e58f9da	\N	40468082-9f36-45a0-bb5b-bca1b83462db	\N	\N	\N	\N	\N	9800989800	+91	merchant_admin	1780417393003	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 21:53:08.479+05:30	2026-06-02 21:53:13.004+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
f8551ac9-5631-4b9d-a5ac-ede82a7cd4d5	\N	c1a6722a-22b4-4014-a5f8-06e58486dfa8	\N	\N	\N	\N	\N	9900000401	+91	merchant_admin	1780498003590	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-03 12:48:32.147+05:30	2026-06-03 20:16:43.591+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
a749e9c3-ce38-40ed-a850-03405b5b4792	\N	62a72147-c37d-4946-85c7-b046aba057e3	\N	\N	\N	\N	\N	7897897890	+91	merchant_admin	1780467700305	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-03 11:51:38.075+05:30	2026-06-03 11:51:40.305+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
c47f368d-3dbf-401e-8d35-79f866908077	\N	5fd1a6de-825d-4196-90ae-e864b2de6c1b	\N	\N	\N	\N	\N	8908908900	+91	merchant_admin	1780473313685	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-06-02 21:54:38.244+05:30	2026-06-03 13:25:13.686+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}	offline	\N	\N	\N
\.


--
-- Data for Name: VendorAIConfigs; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."VendorAIConfigs" (id, "integrationId", "masterPrompt", "faqContext", "isActive", "catalogScoped", "modelName", temperature, "createdAt", "updatedAt") FROM stdin;
72cca7df-106f-44fc-ae59-cef0e262dfbf	908fa830-7d67-4555-8d3b-a72b20636d44	You are a helpful assistant for this store. You only answer questions related to the items in our catalogue.	[{"answer": "", "question": ""}]	t	t	gpt-3.5-turbo	0.7	2026-05-11 13:18:16.754+05:30	2026-05-11 13:39:28.312+05:30
4e20967d-3320-46c1-80b8-86e6b260851f	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	\N	[]	t	t	gpt-3.5-turbo	0.7	2026-05-18 12:20:51.173+05:30	2026-05-18 12:20:51.173+05:30
5ac963f2-3e37-4d5a-aceb-ad3ba3957e4a	09dacbba-d0e7-4862-8a77-e8bded1ea387	You are the premium assistant for Tubulu Master Admin	[{"answer": "Refunds are processed within 3 business days of return.", "question": "What is your refund policy?"}, {"answer": "Delivery is free for orders above 500 rupees.", "question": "Is delivery free?"}]	t	t	gpt-3.5-turbo	0.7	2026-05-24 21:24:24.107+05:30	2026-05-24 21:24:24.107+05:30
e3c1f1a8-5289-4363-a499-6afb11fa0772	bc349e5f-11a0-4020-9150-841d9ce04680	You are a helpful assistant for this store. You only answer questions related to the items in our catalogue.	[{"answer": "organic rice", "question": "what is good about this sotre"}]	t	t	gpt-3.5-turbo	0.7	2026-05-24 21:21:17.774+05:30	2026-05-24 21:27:49.182+05:30
a7cdd17c-d2b3-42e8-b551-8791e9efdad7	1f6b2343-2619-429e-b843-dfda8ed66949	You are a helpful assistant for this store. You only answer questions related to the items in our catalogue.	[{"answer": "We have organic rice", "question": "what is best in your store"}]	t	t	gpt-3.5-turbo	0.7	2026-05-25 17:38:42.229+05:30	2026-05-25 17:39:39.563+05:30
\.


--
-- Data for Name: Wallets; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Wallets" (id, "userId", points, "cashBalance", "referralCode", "referredBy", "createdAt", "updatedAt") FROM stdin;
925ad103-bded-45de-9790-9398565c6180	d0b83594-f364-48c9-aed6-c1cb29c4223b	10	0.00	TUBQJORLF	\N	2026-06-01 15:15:23.244+05:30	2026-06-01 15:15:23.245+05:30
6f21857e-15f3-4d95-88b7-c704b378703d	4202016f-47fd-47e7-ace4-81c2be3d4ee6	37	0.00	TUBJ88MVZ	\N	2026-06-01 15:11:36.443+05:30	2026-06-01 20:49:19.423+05:30
50cd5c6a-c4b0-4185-87c5-1af0ab75ab4f	0893032b-3193-47b5-a046-c0f762670f46	133	0.00	TUBIW1W92	\N	2026-05-29 20:44:17.365+05:30	2026-06-03 12:39:45.205+05:30
\.


--
-- Data for Name: chat_documents; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public.chat_documents (id, "chatRoomId", "userId", "integrationId", "fileUrl", "fileName", "mimeType", "fileSize", sender, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: message_bookmarks; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public.message_bookmarks (id, uuid, "userId", "chatRoomId", "chatMessageId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: message_notes; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public.message_notes (id, uuid, "userId", "chatRoomId", "chatMessageId", "noteMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key1; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key1" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key10; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key10" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key100; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key100" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key101; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key101" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key102; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key102" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key103; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key103" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key104; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key104" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key105; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key105" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key106; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key106" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key107; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key107" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key108; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key108" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key109; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key109" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key11; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key11" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key110; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key110" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key111; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key111" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key112; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key112" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key113; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key113" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key114; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key114" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key115; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key115" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key116; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key116" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key117; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key117" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key118; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key118" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key119; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key119" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key12; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key12" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key120; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key120" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key121; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key121" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key122; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key122" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key123; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key123" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key124; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key124" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key125; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key125" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key126; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key126" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key127; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key127" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key128; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key128" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key129; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key129" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key13; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key13" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key130; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key130" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key131; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key131" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key132; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key132" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key133; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key133" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key134; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key134" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key135; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key135" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key136; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key136" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key137; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key137" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key138; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key138" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key139; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key139" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key14; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key14" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key140; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key140" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key141; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key141" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key142; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key142" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key143; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key143" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key144; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key144" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key145; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key145" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key146; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key146" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key147; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key147" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key148; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key148" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key149; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key149" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key15; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key15" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key150; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key150" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key151; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key151" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key152; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key152" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key153; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key153" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key154; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key154" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key155; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key155" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key156; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key156" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key157; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key157" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key158; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key158" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key159; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key159" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key16; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key16" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key160; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key160" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key161; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key161" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key162; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key162" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key163; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key163" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key164; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key164" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key165; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key165" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key166; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key166" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key167; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key167" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key168; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key168" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key169; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key169" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key17; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key17" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key170; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key170" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key171; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key171" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key172; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key172" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key173; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key173" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key174; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key174" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key175; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key175" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key176; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key176" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key177; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key177" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key178; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key178" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key179; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key179" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key18; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key18" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key180; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key180" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key181; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key181" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key182; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key182" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key183; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key183" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key184; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key184" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key185; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key185" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key186; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key186" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key187; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key187" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key188; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key188" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key189; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key189" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key19; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key19" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key190; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key190" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key191; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key191" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key192; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key192" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key193; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key193" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key194; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key194" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key195; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key195" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key196; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key196" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key197; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key197" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key198; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key198" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key199; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key199" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key2; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key2" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key20; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key20" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key200; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key200" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key201; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key201" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key202; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key202" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key203; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key203" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key204; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key204" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key205; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key205" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key206; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key206" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key207; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key207" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key208; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key208" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key209; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key209" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key21; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key21" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key210; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key210" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key211; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key211" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key212; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key212" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key213; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key213" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key214; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key214" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key215; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key215" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key216; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key216" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key217; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key217" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key218; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key218" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key219; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key219" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key22; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key22" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key220; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key220" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key221; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key221" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key222; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key222" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key223; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key223" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key224; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key224" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key225; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key225" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key226; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key226" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key227; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key227" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key228; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key228" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key229; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key229" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key23; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key23" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key230; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key230" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key231; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key231" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key232; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key232" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key233; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key233" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key234; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key234" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key235; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key235" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key236; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key236" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key237; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key237" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key238; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key238" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key239; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key239" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key24; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key24" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key240; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key240" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key241; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key241" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key242; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key242" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key243; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key243" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key244; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key244" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key245; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key245" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key246; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key246" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key247; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key247" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key248; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key248" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key249; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key249" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key25; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key25" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key250; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key250" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key251; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key251" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key252; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key252" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key253; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key253" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key254; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key254" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key255; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key255" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key256; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key256" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key257; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key257" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key258; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key258" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key259; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key259" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key26; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key26" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key27; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key27" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key28; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key28" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key29; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key29" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key3; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key3" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key30; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key30" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key31; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key31" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key32; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key32" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key33; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key33" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key34; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key34" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key35; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key35" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key36; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key36" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key37; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key37" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key38; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key38" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key39; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key39" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key4; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key4" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key40; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key40" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key41; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key41" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key42; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key42" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key43; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key43" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key44; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key44" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key45; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key45" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key46; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key46" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key47; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key47" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key48; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key48" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key49; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key49" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key5; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key5" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key50; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key50" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key51; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key51" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key52; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key52" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key53; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key53" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key54; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key54" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key55; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key55" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key56; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key56" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key57; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key57" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key58; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key58" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key59; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key59" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key6; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key6" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key60; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key60" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key61; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key61" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key62; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key62" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key63; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key63" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key64; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key64" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key65; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key65" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key66; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key66" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key67; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key67" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key68; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key68" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key69; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key69" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key7; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key7" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key70; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key70" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key71; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key71" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key72; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key72" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key73; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key73" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key74; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key74" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key75; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key75" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key76; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key76" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key77; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key77" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key78; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key78" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key79; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key79" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key8; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key8" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key80; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key80" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key81; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key81" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key82; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key82" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key83; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key83" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key84; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key84" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key85; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key85" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key86; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key86" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key87; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key87" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key88; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key88" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key89; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key89" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key9; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key9" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key90; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key90" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key91; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key91" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key92; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key92" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key93; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key93" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key94; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key94" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key95; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key95" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key96; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key96" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key97; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key97" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key98; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key98" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key99; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key99" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_pkey" PRIMARY KEY (id);


--
-- Name: AdminStaffs AdminStaffs_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AdminStaffs"
    ADD CONSTRAINT "AdminStaffs_pkey" PRIMARY KEY (id);


--
-- Name: Advertisements Advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Advertisements"
    ADD CONSTRAINT "Advertisements_pkey" PRIMARY KEY (id);


--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);


--
-- Name: BlockedIntegrations BlockedIntegrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."BlockedIntegrations"
    ADD CONSTRAINT "BlockedIntegrations_pkey" PRIMARY KEY (id);


--
-- Name: CampaignTemplates CampaignTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."CampaignTemplates"
    ADD CONSTRAINT "CampaignTemplates_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Catalogues Catalogues_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Catalogues"
    ADD CONSTRAINT "Catalogues_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessages ChatMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_pkey" PRIMARY KEY (id);


--
-- Name: ChatRooms ChatRooms_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."ChatRooms"
    ADD CONSTRAINT "ChatRooms_pkey" PRIMARY KEY (id);


--
-- Name: Cities Cities_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Cities"
    ADD CONSTRAINT "Cities_pkey" PRIMARY KEY (id);


--
-- Name: Countries Countries_code_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_code_key" UNIQUE (code);


--
-- Name: Countries Countries_name_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_name_key" UNIQUE (name);


--
-- Name: Countries Countries_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_pkey" PRIMARY KEY (id);


--
-- Name: Customizations Customizations_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Customizations"
    ADD CONSTRAINT "Customizations_pkey" PRIMARY KEY (id);


--
-- Name: Deals Deals_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Deals"
    ADD CONSTRAINT "Deals_pkey" PRIMARY KEY (id);


--
--



--
-- Name: IntegrationDocuments IntegrationDocuments_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationDocuments"
    ADD CONSTRAINT "IntegrationDocuments_pkey" PRIMARY KEY (id);


--
-- Name: IntegrationFBs IntegrationFBs_integrationId_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationFBs"
    ADD CONSTRAINT "IntegrationFBs_integrationId_key" UNIQUE ("integrationId");


--
-- Name: IntegrationFBs IntegrationFBs_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationFBs"
    ADD CONSTRAINT "IntegrationFBs_pkey" PRIMARY KEY (id);


--
-- Name: IntegrationGroceries IntegrationGroceries_integrationId_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationGroceries"
    ADD CONSTRAINT "IntegrationGroceries_integrationId_key" UNIQUE ("integrationId");


--
-- Name: IntegrationGroceries IntegrationGroceries_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationGroceries"
    ADD CONSTRAINT "IntegrationGroceries_pkey" PRIMARY KEY (id);


--
-- Name: IntegrationRetails IntegrationRetails_integrationId_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationRetails"
    ADD CONSTRAINT "IntegrationRetails_integrationId_key" UNIQUE ("integrationId");


--
-- Name: IntegrationRetails IntegrationRetails_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationRetails"
    ADD CONSTRAINT "IntegrationRetails_pkey" PRIMARY KEY (id);


--
-- Name: Integrations Integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_pkey" PRIMARY KEY (id);


--
-- Name: LoyaltyTransactions LoyaltyTransactions_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."LoyaltyTransactions"
    ADD CONSTRAINT "LoyaltyTransactions_pkey" PRIMARY KEY (id);


--
-- Name: MerchantMemberships MerchantMemberships_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."MerchantMemberships"
    ADD CONSTRAINT "MerchantMemberships_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: PhoneBookGroupRelations PhoneBookGroupRelations_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBookGroupRelations"
    ADD CONSTRAINT "PhoneBookGroupRelations_pkey" PRIMARY KEY (id);


--
-- Name: PhoneBookGroups PhoneBookGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBookGroups"
    ADD CONSTRAINT "PhoneBookGroups_pkey" PRIMARY KEY (id);


--
-- Name: PhoneBooks PhoneBooks_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBooks"
    ADD CONSTRAINT "PhoneBooks_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: QRCategories QRCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."QRCategories"
    ADD CONSTRAINT "QRCategories_pkey" PRIMARY KEY (id);


--
-- Name: QRCodes QRCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."QRCodes"
    ADD CONSTRAINT "QRCodes_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: Settlements Settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Settlements"
    ADD CONSTRAINT "Settlements_pkey" PRIMARY KEY (id);


--
-- Name: States States_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."States"
    ADD CONSTRAINT "States_pkey" PRIMARY KEY (id);


--
-- Name: SupportTickets SupportTickets_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SupportTickets"
    ADD CONSTRAINT "SupportTickets_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_key_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key1; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key1" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key10; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key10" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key100; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key100" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key101; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key101" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key102; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key102" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key103; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key103" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key104; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key104" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key105; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key105" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key106; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key106" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key107; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key107" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key108; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key108" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key109; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key109" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key11; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key11" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key110; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key110" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key111; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key111" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key112; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key112" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key113; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key113" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key114; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key114" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key115; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key115" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key116; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key116" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key117; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key117" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key118; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key118" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key119; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key119" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key12; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key12" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key120; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key120" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key121; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key121" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key122; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key122" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key123; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key123" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key124; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key124" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key125; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key125" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key126; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key126" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key127; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key127" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key128; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key128" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key129; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key129" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key13; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key13" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key130; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key130" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key131; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key131" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key132; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key132" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key133; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key133" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key134; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key134" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key135; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key135" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key136; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key136" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key137; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key137" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key138; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key138" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key139; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key139" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key14; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key14" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key140; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key140" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key141; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key141" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key142; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key142" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key143; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key143" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key144; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key144" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key145; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key145" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key146; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key146" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key147; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key147" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key148; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key148" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key149; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key149" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key15; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key15" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key150; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key150" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key151; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key151" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key152; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key152" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key153; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key153" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key154; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key154" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key155; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key155" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key156; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key156" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key157; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key157" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key158; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key158" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key159; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key159" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key16; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key16" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key160; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key160" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key161; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key161" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key162; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key162" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key163; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key163" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key164; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key164" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key165; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key165" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key166; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key166" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key167; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key167" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key168; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key168" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key169; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key169" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key17; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key17" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key170; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key170" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key171; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key171" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key172; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key172" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key173; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key173" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key174; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key174" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key175; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key175" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key176; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key176" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key177; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key177" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key178; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key178" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key179; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key179" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key18; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key18" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key180; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key180" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key181; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key181" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key182; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key182" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key183; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key183" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key184; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key184" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key185; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key185" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key186; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key186" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key187; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key187" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key188; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key188" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key189; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key189" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key19; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key19" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key190; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key190" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key191; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key191" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key192; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key192" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key193; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key193" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key194; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key194" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key195; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key195" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key196; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key196" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key197; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key197" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key198; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key198" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key199; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key199" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key2; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key2" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key20; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key20" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key200; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key200" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key201; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key201" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key202; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key202" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key203; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key203" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key204; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key204" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key205; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key205" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key206; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key206" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key207; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key207" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key208; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key208" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key209; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key209" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key21; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key21" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key210; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key210" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key211; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key211" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key212; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key212" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key213; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key213" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key214; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key214" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key215; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key215" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key216; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key216" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key217; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key217" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key218; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key218" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key219; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key219" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key22; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key22" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key220; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key220" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key23; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key23" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key24; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key24" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key25; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key25" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key26; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key26" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key27; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key27" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key28; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key28" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key29; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key29" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key3; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key3" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key30; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key30" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key31; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key31" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key32; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key32" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key33; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key33" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key34; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key34" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key35; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key35" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key36; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key36" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key37; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key37" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key38; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key38" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key39; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key39" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key4; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key4" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key40; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key40" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key41; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key41" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key42; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key42" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key43; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key43" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key44; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key44" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key45; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key45" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key46; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key46" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key47; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key47" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key48; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key48" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key49; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key49" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key5; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key5" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key50; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key50" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key51; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key51" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key52; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key52" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key53; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key53" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key54; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key54" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key55; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key55" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key56; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key56" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key57; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key57" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key58; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key58" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key59; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key59" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key6; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key6" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key60; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key60" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key61; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key61" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key62; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key62" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key63; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key63" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key64; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key64" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key65; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key65" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key66; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key66" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key67; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key67" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key68; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key68" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key69; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key69" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key7; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key7" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key70; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key70" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key71; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key71" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key72; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key72" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key73; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key73" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key74; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key74" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key75; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key75" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key76; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key76" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key77; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key77" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key78; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key78" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key79; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key79" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key8; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key8" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key80; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key80" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key81; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key81" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key82; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key82" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key83; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key83" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key84; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key84" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key85; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key85" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key86; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key86" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key87; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key87" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key88; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key88" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key89; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key89" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key9; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key9" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key90; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key90" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key91; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key91" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key92; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key92" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key93; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key93" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key94; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key94" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key95; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key95" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key96; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key96" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key97; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key97" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key98; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key98" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key99; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key99" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: UserContacts UserContacts_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserContacts"
    ADD CONSTRAINT "UserContacts_pkey" PRIMARY KEY (id);


--
-- Name: UserContacts UserContacts_userId_contactPhoneNumber_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserContacts"
    ADD CONSTRAINT "UserContacts_userId_contactPhoneNumber_key" UNIQUE ("userId", "contactPhoneNumber");


--
-- Name: UserDealUsages UserDealUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDealUsages"
    ADD CONSTRAINT "UserDealUsages_pkey" PRIMARY KEY (id);


--
-- Name: UserDevices UserDevices_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDevices"
    ADD CONSTRAINT "UserDevices_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: VendorAIConfigs VendorAIConfigs_integrationId_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."VendorAIConfigs"
    ADD CONSTRAINT "VendorAIConfigs_integrationId_key" UNIQUE ("integrationId");


--
-- Name: VendorAIConfigs VendorAIConfigs_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."VendorAIConfigs"
    ADD CONSTRAINT "VendorAIConfigs_pkey" PRIMARY KEY (id);


--
-- Name: Wallets Wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_pkey" PRIMARY KEY (id);


--
-- Name: Wallets Wallets_referralCode_key; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_referralCode_key" UNIQUE ("referralCode");


--
-- Name: chat_documents chat_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.chat_documents
    ADD CONSTRAINT chat_documents_pkey PRIMARY KEY (id);


--
-- Name: message_bookmarks message_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_bookmarks
    ADD CONSTRAINT message_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: message_notes message_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_notes
    ADD CONSTRAINT message_notes_pkey PRIMARY KEY (id);


--
-- Name: chat_messages_chat_room_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX chat_messages_chat_room_id ON public."ChatMessages" USING btree ("chatRoomId");


--
-- Name: chat_messages_created_at; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX chat_messages_created_at ON public."ChatMessages" USING btree ("createdAt");


--
-- Name: chat_rooms_user_id_integration_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX chat_rooms_user_id_integration_id ON public."ChatRooms" USING btree ("userId", "integrationId") WHERE ("isActive" = true);


--
-- Name: chat_rooms_user_id_integration_id_active; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX chat_rooms_user_id_integration_id_active ON public."ChatRooms" USING btree ("userId", "integrationId") WHERE ("isActive" = true);


--
-- Name: cities_name_state_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX cities_name_state_id ON public."Cities" USING btree (name, "stateId");


--
-- Name: embedding_cosine_idx; Type: INDEX; Schema: public; Owner: tubulu_admin
--



--
-- Name: integrations_integration_name; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX integrations_integration_name ON public."Integrations" USING btree ("integrationName");


--
-- Name: integrations_mongo_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX integrations_mongo_id ON public."Integrations" USING btree ("mongoId");


--
-- Name: integrations_phone_number; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX integrations_phone_number ON public."Integrations" USING btree ("phoneNumber");


--
-- Name: merchant_memberships_user_id_integration_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX merchant_memberships_user_id_integration_id ON public."MerchantMemberships" USING btree ("userId", "integrationId");


--
-- Name: products_catalogue_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX products_catalogue_id ON public."Products" USING btree ("catalogueId");


--
-- Name: products_category; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX products_category ON public."Products" USING btree (category);


--
-- Name: products_integration_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX products_integration_id ON public."Products" USING btree ("integrationId");


--
-- Name: products_name; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX products_name ON public."Products" USING btree (name);


--
-- Name: products_sku; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX products_sku ON public."Products" USING btree (sku);


--
-- Name: states_name_country_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX states_name_country_id ON public."States" USING btree (name, "countryId");


--
-- Name: user_contacts_user_id_contact_phone_number; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE UNIQUE INDEX user_contacts_user_id_contact_phone_number ON public."UserContacts" USING btree ("userId", "contactPhoneNumber");


--
-- Name: user_deal_usages_deal_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX user_deal_usages_deal_id ON public."UserDealUsages" USING btree ("dealId");


--
-- Name: user_deal_usages_integration_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX user_deal_usages_integration_id ON public."UserDealUsages" USING btree ("integrationId");


--
-- Name: user_deal_usages_user_id; Type: INDEX; Schema: public; Owner: tubulu_admin
--

CREATE INDEX user_deal_usages_user_id ON public."UserDealUsages" USING btree ("userId");


--
-- Name: AdminStaffs AdminStaffs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AdminStaffs"
    ADD CONSTRAINT "AdminStaffs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id);


--
-- Name: Advertisements Advertisements_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Advertisements"
    ADD CONSTRAINT "Advertisements_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: BlockedIntegrations BlockedIntegrations_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."BlockedIntegrations"
    ADD CONSTRAINT "BlockedIntegrations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: BlockedIntegrations BlockedIntegrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."BlockedIntegrations"
    ADD CONSTRAINT "BlockedIntegrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Carts Carts_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: Carts Carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Catalogues Catalogues_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Catalogues"
    ADD CONSTRAINT "Catalogues_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessages ChatMessages_chatRoomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "ChatMessages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES public."ChatRooms"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatRooms ChatRooms_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."ChatRooms"
    ADD CONSTRAINT "ChatRooms_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatRooms ChatRooms_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."ChatRooms"
    ADD CONSTRAINT "ChatRooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cities Cities_stateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Cities"
    ADD CONSTRAINT "Cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES public."States"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Customizations Customizations_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Customizations"
    ADD CONSTRAINT "Customizations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Deals Deals_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Deals"
    ADD CONSTRAINT "Deals_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: IntegrationDocuments IntegrationDocuments_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationDocuments"
    ADD CONSTRAINT "IntegrationDocuments_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IntegrationFBs IntegrationFBs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationFBs"
    ADD CONSTRAINT "IntegrationFBs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IntegrationGroceries IntegrationGroceries_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationGroceries"
    ADD CONSTRAINT "IntegrationGroceries_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IntegrationRetails IntegrationRetails_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationRetails"
    ADD CONSTRAINT "IntegrationRetails_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Integrations Integrations_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."Cities"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Integrations Integrations_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public."Countries"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Integrations Integrations_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Integrations Integrations_stateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES public."States"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MerchantMemberships MerchantMemberships_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."MerchantMemberships"
    ADD CONSTRAINT "MerchantMemberships_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MerchantMemberships MerchantMemberships_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."MerchantMemberships"
    ADD CONSTRAINT "MerchantMemberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Orders Orders_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: PhoneBookGroupRelations PhoneBookGroupRelations_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBookGroupRelations"
    ADD CONSTRAINT "PhoneBookGroupRelations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."PhoneBookGroups"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PhoneBookGroupRelations PhoneBookGroupRelations_phoneBookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBookGroupRelations"
    ADD CONSTRAINT "PhoneBookGroupRelations_phoneBookId_fkey" FOREIGN KEY ("phoneBookId") REFERENCES public."PhoneBooks"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PhoneBookGroups PhoneBookGroups_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBookGroups"
    ADD CONSTRAINT "PhoneBookGroups_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: PhoneBooks PhoneBooks_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBooks"
    ADD CONSTRAINT "PhoneBooks_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: PhoneBooks PhoneBooks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."PhoneBooks"
    ADD CONSTRAINT "PhoneBooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Products Products_catalogueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_catalogueId_fkey" FOREIGN KEY ("catalogueId") REFERENCES public."Catalogues"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_customizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_customizationId_fkey" FOREIGN KEY ("customizationId") REFERENCES public."Customizations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reviews Reviews_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Settlements Settlements_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Settlements"
    ADD CONSTRAINT "Settlements_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: States States_countryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."States"
    ADD CONSTRAINT "States_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES public."Countries"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SupportTickets SupportTickets_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SupportTickets"
    ADD CONSTRAINT "SupportTickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id);


--
-- Name: SupportTickets SupportTickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SupportTickets"
    ADD CONSTRAINT "SupportTickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: UserContacts UserContacts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserContacts"
    ADD CONSTRAINT "UserContacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: UserDealUsages UserDealUsages_dealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDealUsages"
    ADD CONSTRAINT "UserDealUsages_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES public."Deals"(id);


--
-- Name: UserDealUsages UserDealUsages_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDealUsages"
    ADD CONSTRAINT "UserDealUsages_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id);


--
-- Name: UserDealUsages UserDealUsages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDealUsages"
    ADD CONSTRAINT "UserDealUsages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: UserDevices UserDevices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserDevices"
    ADD CONSTRAINT "UserDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Users Users_scopedCityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_scopedCityId_fkey" FOREIGN KEY ("scopedCityId") REFERENCES public."Cities"(id);


--
-- Name: Users Users_scopedCountryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_scopedCountryId_fkey" FOREIGN KEY ("scopedCountryId") REFERENCES public."Countries"(id);


--
-- Name: Users Users_scopedStateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_scopedStateId_fkey" FOREIGN KEY ("scopedStateId") REFERENCES public."States"(id);


--
-- Name: VendorAIConfigs VendorAIConfigs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."VendorAIConfigs"
    ADD CONSTRAINT "VendorAIConfigs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- Name: Wallets Wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "Wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: message_bookmarks message_bookmarks_chatMessageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_bookmarks
    ADD CONSTRAINT "message_bookmarks_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES public."ChatMessages"(id) ON UPDATE CASCADE;


--
-- Name: message_bookmarks message_bookmarks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_bookmarks
    ADD CONSTRAINT "message_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: message_notes message_notes_chatMessageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_notes
    ADD CONSTRAINT "message_notes_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES public."ChatMessages"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: message_notes message_notes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public.message_notes
    ADD CONSTRAINT "message_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict s5ds5sZdIc06anGIgiNTf8YqQrefzjjMfUJo5zqJjJbaJRVxX4zO2NTsp2P9bF3

