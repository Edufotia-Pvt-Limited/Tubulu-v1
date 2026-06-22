--
-- PostgreSQL database dump
--

\restrict LmkWmmd3IPraFZuVh2eFLVchfKunUngMWYuQMEy944EHf5PgfCtpzhfoGJHcJjC

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
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatRooms" OWNER TO tubulu_admin;

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
    "isAadharVerified" boolean DEFAULT false
);


ALTER TABLE public."Integrations" OWNER TO tubulu_admin;

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
    "personalNote" text
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
    "customizationId" uuid
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
    "portfolioAccess" jsonb DEFAULT '{"merchants": [], "verticals": [], "accessType": "GLOBAL"}'::jsonb
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
-- Data for Name: Advertisements; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Advertisements" (id, name, description, "bannerUrl", "isActive", "isDeleted", "integrationId", "mongoId", "createdAt", "updatedAt", "targetCity", "targetState", latitude, longitude, radius) FROM stdin;
bd45e8ed-d59d-43c8-ad30-6c6e7578403c	50% offer on all the products	login to the app and claim your offer	https://placehold.co/600x400?text=Ad	t	f	908fa830-7d67-4555-8d3b-a72b20636d44	\N	2026-05-16 18:28:47.911+05:30	2026-05-16 18:34:27.242+05:30	\N	\N	\N	\N	\N
09814ecf-761e-4b33-9ae1-6d4e44010011	Admin Mega Sale	Exclusive offers from the platform	https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop	t	f	832d3a09-2688-4891-a6fc-526fe96f298c	\N	2026-05-16 19:59:51.199+05:30	2026-05-16 19:59:51.199+05:30	\N	\N	\N	\N	\N
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
\.


--
-- Data for Name: Catalogues; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Catalogues" (id, "integrationId", name, description, "displayType", "isActive", "createdAt", "updatedAt", "isDeleted", "mongoId") FROM stdin;
550e8400-e29b-41d4-a716-446655440000	e28a1344-1a50-48e9-a291-c185ad658482	Premium Bakery Treats	Fresh daily pastries, bread, and personalized cakes.	Grid View	t	2026-05-10 09:48:01.803868+05:30	2026-05-10 09:48:01.803868+05:30	f	\N
cat_8bd8822dbd89da8f	908fa830-7d67-4555-8d3b-a72b20636d44	Main Food Menu	Standard test menu containing appetizers, mains, and desserts.	LIST	t	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	f	\N
cat_99cca0524609a55e	908fa830-7d67-4555-8d3b-a72b20636d44	Cold Drinks & Mocktails	Refreshing beverages, mocktails, and fruit juices.	LIST	t	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	f	\N
01c56244-fde9-4372-b2fc-da4288f161b7	0bfbb67d-2547-4106-a876-ad0db8a8af88	Main Catalogue	Primary grocery and fresh items catalogue for Fresh & Green Organics	\N	t	2026-05-18 09:53:26.401+05:30	2026-05-18 09:53:26.401+05:30	f	\N
42c023ee-8378-48be-a641-5b13a6fba3cd	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	Main Catalogue	Primary grocery and fresh items catalogue for The Gourmet Pantry	\N	t	2026-05-18 09:53:26.421+05:30	2026-05-18 09:53:26.421+05:30	f	\N
303063e3-82e1-4cc4-b58c-b7801b54c2e3	1495f4e0-101d-468a-b2a7-a71ff514d7a2	Main Catalogue	Primary grocery and fresh items catalogue for Spice & Harvest Co.	\N	t	2026-05-18 09:53:26.436+05:30	2026-05-18 09:53:26.436+05:30	f	\N
15b0d44c-efc7-4255-a6df-6ee823d86292	b62f1b85-31fe-4065-a964-3ce587191c59	Main Catalogue	Primary grocery and fresh items catalogue for Daily Needs Supermarket	\N	t	2026-05-18 09:53:26.447+05:30	2026-05-18 09:53:26.447+05:30	f	\N
0318b0ab-23bc-4ec5-993f-f50d24766a5e	d2912933-a21d-475e-a004-04acc4f455ca	Main Catalogue	Primary grocery and fresh items catalogue for Nature's Basket Premium	\N	t	2026-05-18 09:53:26.459+05:30	2026-05-18 09:53:26.459+05:30	f	\N
f3170057-94d6-4a8c-9d45-1732e09f1b96	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	Fresh Dairy & Bakery Menu	Organic milk products, farm fresh eggs, and artisan breads.	\N	t	2026-05-18 12:20:51.174+05:30	2026-05-18 12:20:51.174+05:30	f	\N
\.


--
-- Data for Name: ChatMessages; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."ChatMessages" (id, "mongoId", "chatRoomId", sender, content, metadata, "isRead", "createdAt", "updatedAt") FROM stdin;
b43dd190-6d82-4a9b-9488-421adc30bf59	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Hello	{"type": "TEXT", "uuid": "3c53519d-2d5e-4d43-b144-77ba8cd78448", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:45:32.207+05:30	2026-05-11 13:45:32.207+05:30
5fa8478e-439e-40db-bb42-7f29502d16de	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Hello	{"type": "TEXT", "uuid": "38e9012d-83e3-4b28-b641-68f987651f7f", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:47:08.208+05:30	2026-05-11 13:47:08.208+05:30
c0b2d69a-12cc-4c78-8670-6c7dad1ba0e4	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	hello	{"type": "TEXT", "uuid": "8033a756-1970-40fe-9f9b-ea58f0ac5e22", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:48:01.741+05:30	2026-05-11 13:48:01.741+05:30
9a7af655-af5e-4e39-9f17-42b0905e9d1d	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	he	{"type": "TEXT", "uuid": "64510339-36bc-45f1-a083-811d7bc5a4f9", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:51:49.285+05:30	2026-05-11 13:51:49.285+05:30
dac1935b-0360-4768-94ad-37debabd60ed	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	hello	{"type": "TEXT", "uuid": "eaf59ad7-3c37-42e1-9965-0bb41a6676a5", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:51:55.912+05:30	2026-05-11 13:51:55.912+05:30
35e8db19-d3c0-4dc8-8303-fe77a5b38a42	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Hello	{"type": "TEXT", "uuid": "f7c149cb-3132-41d2-bffc-d924bea3daca", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:56:39.479+05:30	2026-05-11 13:56:39.479+05:30
575ab143-31d7-4e0e-bd04-49f32057b265	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! I can help you find items from our catalogue. What can I help you with today?	{"type": "TEXT", "uuid": "1357282c-0e5a-47ee-942b-882f629be594", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 13:56:45.972+05:30	2026-05-11 13:56:45.972+05:30
a776c526-e7bc-4146-a2ca-fe18c048fc0b	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	hello	{"type": "TEXT", "uuid": "9efccab5-3a0e-45d6-8bed-5b59945f9641", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:58:20.158+05:30	2026-05-11 13:58:20.158+05:30
172ac213-1656-4378-b9e8-38afadee3b62	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! I'm here to help you find products from our catalogue. What would you like to order today? We have burgers, pizzas, sides, sandwiches, desserts, mocktails, coffee, smoothies, and soft drinks available.	{"type": "TEXT", "uuid": "69152137-211e-4194-a363-846f7966e8ae", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 13:58:27.689+05:30	2026-05-11 13:58:27.689+05:30
f4b76e15-ad01-49a4-8e32-344fd8af4322	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	hello	{"type": "TEXT", "uuid": "df93734a-3cef-412e-a330-bcbeb97c55ea", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 13:58:54.724+05:30	2026-05-11 13:58:54.724+05:30
393f9e94-11bb-4b6d-96b1-7e5332b5f69b	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! I can help you find items from our catalogue. What would you like to know?	{"type": "TEXT", "uuid": "9d62a09b-7adf-4fed-bd14-34ebeaa59402", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 13:58:59.839+05:30	2026-05-11 13:58:59.839+05:30
50ae400e-3092-4d17-b575-47573cfed7bb	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	heloo	{"type": "TEXT", "uuid": "e57c5716-a222-4cd6-ad1f-5fe8570d6cec", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:01:18.214+05:30	2026-05-11 14:01:18.214+05:30
a2521edd-9310-40f1-8e08-d31ff4d6af18	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! Welcome to test 1 store. How can I help you find something from our menu today?	{"type": "TEXT", "uuid": "d312549c-e58f-4a6c-9564-d6e3141f37de", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:01:19.18+05:30	2026-05-11 14:01:19.18+05:30
312853c1-d9b2-4b05-9867-4687277248cd	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	hello	{"type": "TEXT", "uuid": "335f848f-a82e-4af1-a5b9-313ae1cf3cae", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:04:17.181+05:30	2026-05-11 14:04:17.181+05:30
fa04da7e-fba7-41b5-9f65-890d958c9881	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! How can I help you find something from our catalogue today?	{"type": "TEXT", "uuid": "71aaea27-7d5d-4885-88d3-9a37e03b6b5a", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:04:24.288+05:30	2026-05-11 14:04:24.288+05:30
b68320eb-6f58-4451-b596-7445e3dcf884	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Hello	{"type": "TEXT", "uuid": "8ba30002-4ed9-485a-9463-092e08e1018d", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:06:02.021+05:30	2026-05-11 14:06:02.021+05:30
d0749af5-ae46-4e86-a5a8-bea7199b8c6f	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! I am here to help you find items from our catalogue. What can I help you with today?	{"type": "TEXT", "uuid": "ba7fcdf4-a505-49b3-ac62-f46b2f6decf3", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:06:21.184+05:30	2026-05-11 14:06:21.184+05:30
8db98b60-565e-4256-bbfd-e90427cfdbdc	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	I need some food	{"type": "TEXT", "uuid": "6f1e9375-2024-44c1-be69-cfe26c69fdf6", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:10:12.288+05:30	2026-05-11 14:10:12.288+05:30
4a8fbedf-4a7b-4da9-aa62-71dd16cd251d	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Of course! Here are the food items available in our catalogue:\n\n**Burgers**\n*   **Classic Veg Burger** - ₹159: Tasty veggie burger with lettuce and special sauce. (Stock: 96)\n\n**Pizza**\n*   **Margherita Pizza** - ₹349: Double cheese loaded freshly baked pizza. (Stock: 99)\n\n**Sandwiches**\n*   **Grilled Chicken Sandwich** - ₹210: Freshly grilled chicken loaded with cheese and mayo. (Stock: 100)\n\n**Sides**\n*   **Peri Peri Fries** - ₹99: Crispy golden fries dusted with spicy peri peri powder. (Stock: 100)\n\n**Desserts**\n*   **Choco Lava Cake** - ₹120: Molten hot chocolate filling inside gooey cake. (Stock: 100)	{"type": "TEXT", "uuid": "aae931fe-9ef0-4e05-9538-f7078059faeb", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:10:22.445+05:30	2026-05-11 14:10:22.445+05:30
65c6add6-7ba8-436c-addf-76493a81e7c9	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Book me the baked pizza	{"type": "TEXT", "uuid": "d72f545a-4e43-479f-abad-8ad855ef4f76", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:10:44.273+05:30	2026-05-11 14:10:44.273+05:30
131d1508-8e32-4519-b736-767a56ac4d45	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Certainly! We have the **Margherita Pizza** for you.\n\nIt's a double cheese loaded freshly baked pizza.\n\n*   **Price:** ₹349\n*   **Stock:** 99 available\n\nWould you like to order this?	{"type": "TEXT", "uuid": "21ff01a3-7676-47a7-a24f-b24c0f2739a8", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:10:50.036+05:30	2026-05-11 14:10:50.036+05:30
b91449c5-52b7-45db-b4c6-9dad2314a133	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Yes check out	{"type": "TEXT", "uuid": "e690be75-6e29-43ee-9e30-7af7d2965fb8", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:11:12.383+05:30	2026-05-11 14:11:12.383+05:30
c56812ee-7576-44c1-a0c2-b2b2a3118408	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	I'd be happy to help you with your order! Could you please let me know which items from our catalogue you'd like to check out? Here's our menu again for your reference:\n\n**Burgers:**\n- Classic Veg Burger: ₹159 (Stock: 96)\n\n**Pizza:**\n- Margherita Pizza: ₹349 (Stock: 99)\n\n**Sandwiches:**\n- Grilled Chicken Sandwich: ₹210 (Stock: 100)\n\n**Sides:**\n- Peri Peri Fries: ₹99 (Stock: 100)\n\n**Desserts:**\n- Choco Lava Cake: ₹120 (Stock: 100)\n\n**Drinks:**\n- Fresh Lime Soda: ₹79 (Stock: 250)\n- Iced Caramel Macchiato: ₹189 (Stock: 250)\n- Mango Smoothie: ₹149 (Stock: 250)\n- Virgin Mojito: ₹129 (Stock: 250)\n- Coca Cola 500ml: ₹45 (Stock: 250)\n\nJust let me know what you'd like to order and I can help you with the details!	{"type": "TEXT", "uuid": "8e74e503-07fb-46a9-800f-446c266332db", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:11:15.679+05:30	2026-05-11 14:11:15.679+05:30
b71e1d0f-709f-4df7-9653-e995d71af0bc	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Classic veg burger	{"type": "TEXT", "uuid": "63e551e9-d35f-4f3d-b909-58be38635178", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:11:53.148+05:30	2026-05-11 14:11:53.148+05:30
c3fb5b67-e8bd-43f4-b6a8-b9b254bc285c	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Classic Veg Burger:\n- Price: ₹159\n- Description: Tasty veggie burger with lettuce and special sauce.\n- Category: Burgers\n- Stock: 96	{"type": "TEXT", "uuid": "b33c1bb6-2291-4ed5-a312-2865a7de356c", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:11:59.088+05:30	2026-05-11 14:11:59.088+05:30
ccbb99a8-cca0-4c49-bcbc-8cdbcc9eb7a7	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Add it to the cart	{"type": "TEXT", "uuid": "f6737eeb-c88b-4fdd-a35c-0c6cf1030cfc", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-11 14:12:26.63+05:30	2026-05-11 14:12:26.63+05:30
390cb71d-10c7-447b-8405-f8bf755f598b	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Sure, I can help with that. Please tell me which item you would like to add to your cart. You can choose from our catalogue, for example:\n\n*   Classic Veg Burger: ₹159\n*   Margherita Pizza: ₹349\n*   Peri Peri Fries: ₹99\n*   Grilled Chicken Sandwich: ₹210\n*   Choco Lava Cake: ₹120\n*   Fresh Lime Soda: ₹79\n*   Iced Caramel Macchiato: ₹189\n*   Mango Smoothie: ₹149\n*   Virgin Mojito: ₹129\n*   Coca Cola 500ml: ₹45	{"type": "TEXT", "uuid": "61c57187-9bee-4237-a90d-b977e14b7ed5", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-11 14:12:37.367+05:30	2026-05-11 14:12:37.367+05:30
218517f2-e5b0-41a6-99fd-5cd1583f2e14	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	user	Hello	{"type": "TEXT", "uuid": "d3d08c44-b0d1-4365-a164-2e02a07d955e", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 13:26:30.206+05:30	2026-05-14 13:26:30.206+05:30
40d7754d-1540-44e6-99b8-751e1c943f11	\N	647f1789-c7d7-438d-8bfa-89d7292036bc	assistant	Hello! How can I help you find something from our catalogue today?	{"type": "TEXT", "uuid": "3b773495-6249-4b1b-8898-70e10cc31d3a", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 13:26:40.454+05:30	2026-05-14 13:26:40.454+05:30
ac3f9f88-9502-4f53-9601-1f3cde4bb2e5	\N	194d1571-a0b9-4025-84e5-b9d98797fb4c	user	hello	{"type": "TEXT", "uuid": "977b2c55-f227-44f3-9ce4-7a40add6ef77", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 13:52:58.683+05:30	2026-05-14 13:52:58.683+05:30
278e31b3-14ed-40d2-8e3c-540ffcbce563	\N	194d1571-a0b9-4025-84e5-b9d98797fb4c	assistant	Hello! How can I help you find something from our catalogue today?	{"type": "TEXT", "uuid": "e63817c5-99cb-41d6-8d90-c7068ea286a3", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 13:53:03.048+05:30	2026-05-14 13:53:03.048+05:30
cb1c6af9-c347-4fdd-999b-486c817ec603	\N	e412bab7-d4b4-4734-9d57-54c159da155d	user	hello	{"type": "TEXT", "uuid": "03c825b3-edc4-48e1-b7c5-efa1b737ed79", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 13:53:20.952+05:30	2026-05-14 13:53:20.952+05:30
65c3c72f-7360-4358-a935-413cb31de78e	\N	e412bab7-d4b4-4734-9d57-54c159da155d	assistant	Hello! Welcome. How can I help you find something from our catalogue today?	{"type": "TEXT", "uuid": "161145c8-adf0-4b2d-9095-f9f33d1b6271", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 13:53:27.931+05:30	2026-05-14 13:53:27.931+05:30
3ce37d5b-0982-4d0e-b932-67ce408ca08f	\N	0980e5a8-9cbc-47b9-8fe7-fc0c00ab45dc	user	What should i order here	{"type": "TEXT", "uuid": "fd7f5d0a-70fb-4e82-b3f6-5a362acd80c5", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 14:10:56.824+05:30	2026-05-14 14:10:56.824+05:30
1a5156e2-ccdb-4655-a27b-4d25f07bfa06	\N	0980e5a8-9cbc-47b9-8fe7-fc0c00ab45dc	assistant	I'm currently looking into your request. Could you please hold on a moment?	{"type": "TEXT", "uuid": "fa9f0bb9-fc78-4a08-8570-d27d450e40ca", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 14:11:06.862+05:30	2026-05-14 14:11:06.862+05:30
92709a90-30c3-4208-8bd6-b5569d8bb275	\N	0980e5a8-9cbc-47b9-8fe7-fc0c00ab45dc	user	What shoud i order here ?	{"type": "TEXT", "uuid": "d6f352ae-0422-41b1-aae8-8011e1a1a6f7", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 14:16:38.336+05:30	2026-05-14 14:16:38.336+05:30
fcd1f280-8949-4415-940e-68e43e6ff1dd	\N	0980e5a8-9cbc-47b9-8fe7-fc0c00ab45dc	assistant	Hi there! Based on a fantastic 5-star review from your friend Rahul, I can definitely help with that!\n\nRahul said our **Peri Peri Fries** and **Margherita Pizza** are absolutely incredible. Since you're looking for a recommendation, I'd suggest starting with one of those.\n\n*   **Peri Peri Fries** (₹99): Crispy golden fries dusted with spicy peri peri powder. We have 100 in stock.\n*   **Margherita Pizza** (₹349): A double cheese loaded, freshly baked pizza. We have 99 in stock.\n\nIf you're in the mood for something else, we have a great variety!\n\n*   **Burgers:** Try our **Classic Veg Burger** (₹159) for a tasty option with lettuce and special sauce.\n*   **Desserts:** The **Choco Lava Cake** (₹120) is perfect if you have a sweet tooth—it comes with a molten hot chocolate filling!\n*   **Drinks:** We have refreshing options like the **Mango Smoothie** (₹149) or a classic **Fresh Lime Soda** (₹79).\n\nWhat sounds good to you?	{"type": "TEXT", "uuid": "43c5dd75-bc02-46d3-9ee2-afe63fe75514", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 14:16:53.058+05:30	2026-05-14 14:16:53.058+05:30
beacf0fd-53f8-4b5c-8574-57e1cb6c08fe	\N	d160eb72-7e1c-405c-9cd6-d566146a866b	user	What should i order here ?	{"type": "TEXT", "uuid": "03e722cf-73c1-4f03-afcd-8fd967b74d6d", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 14:19:49.455+05:30	2026-05-14 14:19:49.455+05:30
32399b36-48c9-4515-8976-731726d0bbf6	\N	d160eb72-7e1c-405c-9cd6-d566146a866b	assistant	A friend of yours, Rahul, actually left a fantastic review! He rated us 5/5 stars and said our Peri Peri Fries and Margherita Pizza are "absolutely incredible."\n\nBased on that, here are a few popular choices:\n\n*   **For a great meal:** Start with the **Peri Peri Fries (₹99)** and then get a **Margherita Pizza (₹349)**.\n*   **To complete your order:** You could add a **Choco Lava Cake (₹120)** for dessert.\n*   **If you're looking for a drink:** We have the **Iced Caramel Macchiato (₹189)** or a refreshing **Virgin Mojito (₹129)**.	{"type": "TEXT", "uuid": "0ed9d169-fe69-426a-b072-10f2452ee3ec", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 14:20:01.063+05:30	2026-05-14 14:20:01.063+05:30
fc7531c4-c1e6-47d0-b501-e474898108f7	\N	c00a46b2-1ce0-4182-b655-b9c3c0927da2	user	Hello	{"type": "TEXT", "uuid": "679d97ce-4648-4589-84b9-9a0787c6436c", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 16:14:58.638+05:30	2026-05-14 16:14:58.638+05:30
17abca7a-14b6-4d61-af96-8dfa0c4e1ed5	\N	c00a46b2-1ce0-4182-b655-b9c3c0927da2	assistant	Hello! I'm here to help you find something delicious from our menu.\n\nA friend of mine, Rahul, gave this store 5 stars and said our Peri Peri Fries are absolutely incredible! They're crispy, golden, and dusted with spicy peri peri powder.\n\nWhat can I get for you today? Feel free to ask me about any item on our catalogue	{"type": "TEXT", "uuid": "67358ba7-e038-4549-a2f6-1a4d6a22a1d5", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 16:15:09.616+05:30	2026-05-14 16:15:09.616+05:30
5d70afd5-ae54-48b3-92b1-b33d355c8a1e	\N	fb0d2702-4191-4e71-8844-abf0429d2665	user	hello	{"type": "TEXT", "uuid": "d7f1da50-0f0f-471a-a2d8-6dec0d57c30f", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 17:58:43.671+05:30	2026-05-14 17:58:43.671+05:30
9bf9627a-8572-4c2c-ad2a-08663da02bab	\N	fb0d2702-4191-4e71-8844-abf0429d2665	assistant	Hello! Welcome to test 1. I'm here to help you find something from our catalogue. What would you like to order today?	{"type": "TEXT", "uuid": "5a0c02f2-6361-4e9f-bbba-efeb1fc92d50", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 17:58:51.364+05:30	2026-05-14 17:58:51.364+05:30
848f6c65-f844-43a1-876c-613a3acbb78b	\N	fb0d2702-4191-4e71-8844-abf0429d2665	user	What is the speciality her e?	{"type": "TEXT", "uuid": "42d2a6a6-4c5b-4f6a-898a-6cf0b43ac85c", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-14 17:59:23.498+05:30	2026-05-14 17:59:23.498+05:30
5e6ce8df-bd5d-4d5f-b479-792641c26d1e	\N	fb0d2702-4191-4e71-8844-abf0429d2665	assistant	Oh, that's easy! Our friend Rahul gave us a 5-star review and said our Peri Peri Fries and Margherita Pizza are absolutely incredible.\n\nOur Peri Peri Fries are ₹99 and are crispy golden fries dusted with spicy peri peri powder. We also have a Double cheese loaded freshly baked Margherita Pizza for ₹349. Those are definitely some of our specialties	{"type": "TEXT", "uuid": "0ce95713-f821-49b9-8bfa-e4330b8b98da", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-14 17:59:32.835+05:30	2026-05-14 17:59:32.835+05:30
39fa0b48-58fe-4f4a-8784-6b78d031d43c	\N	07245dac-8b16-4efa-9452-9a6e651f83db	user	Hello	{"type": "TEXT", "uuid": "ca71b2ed-e258-4bc2-9255-1b83b57ffca0", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44", "messageByUser": "0893032b-3193-47b5-a046-c0f762670f46"}	f	2026-05-18 10:03:16.641+05:30	2026-05-18 10:03:16.641+05:30
1ccc1777-2ab0-4f53-aa67-ca286cb18f03	\N	07245dac-8b16-4efa-9452-9a6e651f83db	assistant	Hello! Welcome to Anand Bakery. I'm here to help you find something delicious from our menu. What can I help you with today?	{"type": "TEXT", "uuid": "94a557bc-d3c9-45b0-90fb-d115e47feb8d", "integrationId": "908fa830-7d67-4555-8d3b-a72b20636d44"}	f	2026-05-18 10:03:34.512+05:30	2026-05-18 10:03:34.512+05:30
\.


--
-- Data for Name: ChatRooms; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."ChatRooms" (id, "mongoId", "userId", "integrationId", "lastMessage", "isActive", "createdAt", "updatedAt") FROM stdin;
7ef81053-9cd2-406a-ac7a-a0979b36eedb	\N	0893032b-3193-47b5-a046-c0f762670f46	8120904e-9a4e-47d3-812c-4f86c88bab45	\N	t	2026-05-12 11:18:02.022+05:30	2026-05-12 11:18:02.022+05:30
498908aa-964b-4edb-a291-2911304c7d80	\N	0893032b-3193-47b5-a046-c0f762670f46	e28a1344-1a50-48e9-a291-c185ad658482	\N	t	2026-05-12 11:21:54.254+05:30	2026-05-12 11:21:54.254+05:30
647f1789-c7d7-438d-8bfa-89d7292036bc	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-11 13:41:46.276+05:30	2026-05-14 13:34:23.225+05:30
194d1571-a0b9-4025-84e5-b9d98797fb4c	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 13:52:54.88+05:30	2026-05-14 13:53:16.008+05:30
e412bab7-d4b4-4734-9d57-54c159da155d	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 13:53:16.009+05:30	2026-05-14 14:10:36.774+05:30
973dab49-a0cb-4ae5-a9fa-793914810dc6	\N	0893032b-3193-47b5-a046-c0f762670f46	55926449-d540-428f-961e-499be108c51c	\N	f	2026-05-14 13:34:09.456+05:30	2026-05-14 14:19:34.326+05:30
edb45334-2ace-4388-8214-53a114d908fa	\N	0893032b-3193-47b5-a046-c0f762670f46	55926449-d540-428f-961e-499be108c51c	\N	t	2026-05-14 14:19:34.329+05:30	2026-05-14 14:19:34.329+05:30
0980e5a8-9cbc-47b9-8fe7-fc0c00ab45dc	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 14:10:36.777+05:30	2026-05-14 14:19:40.221+05:30
d160eb72-7e1c-405c-9cd6-d566146a866b	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 14:19:40.222+05:30	2026-05-14 16:14:53.441+05:30
c00a46b2-1ce0-4182-b655-b9c3c0927da2	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 16:14:53.45+05:30	2026-05-14 17:43:55.544+05:30
b5f90836-e883-4f9b-9583-a583b6060e8b	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 17:43:55.548+05:30	2026-05-14 17:58:39.532+05:30
fb0d2702-4191-4e71-8844-abf0429d2665	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	f	2026-05-14 17:58:39.533+05:30	2026-05-18 10:03:12.495+05:30
07245dac-8b16-4efa-9452-9a6e651f83db	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	\N	t	2026-05-18 10:03:12.499+05:30	2026-05-18 10:03:12.499+05:30
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
\.


--
-- Data for Name: IntegrationDocuments; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."IntegrationDocuments" (id, uuid, "integrationId", "documentUrl", "documentName", "documentOriginalName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Integrations; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Integrations" (id, "mongoId", logo, "integrationName", "apiUrl", "chatBaseUrl", description, "webhookUrl", "apiAuthKey", "welcomeMessagePayLoad", "phoneNumber", email, category, "isActive", "isApproved", "isOnboarded", "addressLine", city, state, country, pincode, landmark, "gstNumber", "panNumber", "aadharNumber", razorpay, "cdpAccessToken", "createdAt", "updatedAt", latitude, longitude, website, "isDocumentsUploaded", "isTubuluAppSetupDone", "shopEstablishmentNumber", "verticalType", capabilities, "phoneNumberOtp", "phoneVerificationExpiry", documents, role, "emailOtp", "emailVerificationExpiry", "parentId", upi, "assignedCity", "commissionRate", "trustScore", "isGstVerified", "isPanVerified", "isAadharVerified") FROM stdin;
8120904e-9a4e-47d3-812c-4f86c88bab45	\N	http://10.0.2.2:3008/images/bakery2.png	E2E Test Bakery	\N	\N	\N	\N	cbfda736-4f6a-4396-a0f7-4e4e71b4b25d	{}	+911234567890		FB	t	t	t				\N	\N	\N				{}	\N	2026-05-09 21:00:52.565+05:30	2026-05-16 19:46:27.885+05:30	12.97160000	77.59460000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	123456	2026-05-11 14:37:03+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
908fa830-7d67-4555-8d3b-a72b20636d44	\N	http://10.0.2.2:3008/images/bakery1.png	Anand Bakery	\N	\N	\N	\N	f2291716-f863-49bb-8600-ef34c1f85499	{}	1234512345	adfdf@f.com	FB	t	t	t	fdsafdsaf	fasdfds	karnataka	India	565656	fasdfdsf				{}	\N	2026-05-09 20:18:46.998+05:30	2026-05-16 19:46:38.451+05:30	12.97880000	77.64080000	fadsfds	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-15 18:21:56+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
832d3a09-2688-4891-a6fc-526fe96f298c	\N	http://10.0.2.2:3008/images/bakery1.png	pradeep	\N	\N	\N	\N	0bd06e5a-1450-42b3-b0f2-c2baa5704c6c	{}	+919844982389	\N	SuperAdmin	t	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-10 16:27:34.981+05:30	2026-05-16 15:05:53.777+05:30	12.91410000	77.64120000	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	889056	2026-05-16 13:20:40+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
55926449-d540-428f-961e-499be108c51c	\N	http://10.0.2.2:3008/images/bakery3.png	E2E Test Bakery (DUPLICATE)	\N	\N	\N	\N	ffbb9e23-ca2d-4e10-88a6-3d488d68db5d	{}	1234567890	\N	Food	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-09 20:37:55.932+05:30	2026-05-16 15:40:41.481+05:30	12.97160000	77.59460000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	123456	2026-05-11 11:13:27+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
e28a1344-1a50-48e9-a291-c185ad658482	\N	http://10.0.2.2:3008/images/bakery1.png	E2E Test Bakery (DUPLICATE)	\N	\N	\N	\N	81718569-63e7-4fc5-a9c6-578cbbd13ad9	{}	+1234567890	\N	Food	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-09 20:38:05.917+05:30	2026-05-16 15:40:41.481+05:30	12.97160000	77.59460000	\N	t	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	123456	2026-05-10 20:38:05+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
276a3e39-06aa-46ab-b73b-774f8192fb11	\N	http://10.0.2.2:3008/images/bakery1.png	test 	\N	\N	\N	\N	a63133c9-9474-4d3d-88d8-1cbf40c6b7f1	{}	9090909090		FB	t	t	t	fadsfd	fsadf	fsadf	India	fsdaf	\N				{}	\N	2026-05-09 20:11:08.706+05:30	2026-05-16 19:46:45.475+05:30	12.91410000	77.64120000	\N	f	t	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
3a15184a-8dd9-4f88-99d9-b43781c3a6b1	\N	http://10.0.2.2:3008/images/bakery1.png	fsdgfg	\N	\N	\N	\N	6f3fdd03-2e37-4907-bfed-1f6d0741803d	{}	+918989898989	sgfg@g.vom	AI & ML	t	t	t	dfds	gsdfgdfsg	gsdfg	Andorra	454545	sdfgdfg	\N	\N	\N	{}	\N	2026-05-10 15:42:14.557+05:30	2026-05-16 19:48:12.952+05:30	12.91410000	77.64120000	sdfgdsfg	f	f	\N	AI	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-15 18:21:33+05:30	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
09dacbba-d0e7-4862-8a77-e8bded1ea387	\N	http://10.0.2.2:3008/images/bakery1.png	Tubulu Master Admin	\N	\N	\N	\N	\N	{}	+919999999999	\N	SuperAdmin	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-09 15:34:03.95039+05:30	2026-05-16 15:32:40.925+05:30	12.91410000	77.64120000	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-16 11:50:12+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
6a118b58-8ee8-4e18-ac05-0942e163ebbc	69eb13d588167fc5c527cbe2	\N	bhavan	\N	\N	\N	\N	e796e10e-493c-4127-88b3-08779f533946	{}	+918788463543		FB	t	t	f	asdfadf			\N	\N	\N				{}	\N	2026-04-24 12:25:17.253+05:30	2026-05-16 19:48:55.336+05:30	\N	\N	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
6c858926-3ba4-4c6c-9cce-e134b4a77a20	\N	http://10.0.2.2:3008/images/bakery1.png	Tubulu Master Admin (DUPLICATE)	\N	\N	\N	\N	4f094085-e829-42da-b1c8-c7f95f6945c7	{}	9999999999	\N	SuperAdmin	f	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-09 15:42:29.009+05:30	2026-05-16 15:40:41.481+05:30	12.91410000	77.64120000	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	000000	2026-05-16 10:56:19+05:30	[]	super_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
0bfbb67d-2547-4106-a876-ad0db8a8af88	\N	https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop	Fresh & Green Organics	\N	\N	Earthy, farm-to-table organic produce, premium fresh fruits, herbs, and hydroponic greens.	\N	\N	{}	+919900000001	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.353+05:30	2026-05-18 09:53:26.353+05:30	12.97250000	77.59550000	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	\N	https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=600&auto=format&fit=crop	The Gourmet Pantry	\N	\N	Curated selection of fine European cheeses, bronze-cut pastas, organic honey, olive oils, and spreads.	\N	\N	{}	+919900000002	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.419+05:30	2026-05-18 09:53:26.419+05:30	12.97550000	77.59950000	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
1495f4e0-101d-468a-b2a7-a71ff514d7a2	\N	https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop	Spice & Harvest Co.	\N	\N	Traditional store for unpolished pulses, handpicked whole spices, fresh flours, and dry fruits.	\N	\N	{}	+919900000003	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.433+05:30	2026-05-18 09:53:26.433+05:30	12.96950000	77.59250000	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
b62f1b85-31fe-4065-a964-3ce587191c59	\N	https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=600&auto=format&fit=crop	Daily Needs Supermarket	\N	\N	Your neighborhood hypermarket for daily dairy, bread, eggs, packaged snacks, drinks, and home hygiene products.	\N	\N	{}	+919900000004	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.444+05:30	2026-05-18 09:53:26.444+05:30	12.97850000	77.59150000	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
d2912933-a21d-475e-a004-04acc4f455ca	\N	https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop	Nature's Basket Premium	\N	\N	Exotic wellness destination for vegan milk, organic chia seeds, gluten-free superfoods, and cold-pressed juices.	\N	\N	{}	+919900000005	\N	GROCERY	t	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 09:53:26.458+05:30	2026-05-18 09:53:26.458+05:30	12.96550000	77.60150000	\N	f	t	\N	GROCERY	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	\N	\N	Fresh & Fast Supermarket Staging	\N	\N	\N	\N	d7d832f5-9df5-413f-8a10-3748c9658a78	{}	9876543210	\N	GROCERY	t	t	t	\N	Bangalore	Karnataka	\N	\N	\N	\N	\N	\N	{}	\N	2026-05-18 12:20:51.16+05:30	2026-05-18 12:20:51.16+05:30	\N	\N	\N	f	f	\N	FB	{"hasDelivery": true, "hasInventory": true, "hasTableBooking": false, "hasSeatSelection": false}	\N	\N	[]	merchant_admin	\N	\N	\N	{"vpa": "", "connected": false, "merchantName": ""}	\N	0.00	0	f	f	f
\.


--
-- Data for Name: MerchantMemberships; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."MerchantMemberships" (id, "userId", "integrationId", role, permissions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Orders" (id, "mongoId", "userId", "integrationId", "cartId", "catalogueId", "addressId", "orderItems", "discountAmount", "totalPrice", "totalQuantity", "orderMessage", "deliveryType", "paymentStatus", "paymentMethod", "razorpayOrderId", status, "isActive", "createdAt", "updatedAt", "statusLogs", "acceptedAt", "packedAt", "dispatchedAt", "deliveredAt", "personalNote") FROM stdin;
5821df2b-ab0d-4ee9-a0de-de3ea542d402	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	12d6fedd-e5b5-4aa7-9836-8b572071ff9a	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Margherita Pizza", "sgst": 0, "price": 349, "total": 349, "quantity": 1, "productId": "prod_2056c34994815b36", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Pizza", "customizationDetails": []}]	0	349	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-11 11:07:17.197+05:30	2026-05-11 12:37:33.424+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T05:43:04.950Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T07:07:33.423Z"}]	2026-05-11 11:13:04.95+05:30	\N	\N	2026-05-11 12:37:33.423+05:30	\N
955a75d9-65ba-40bb-af7f-dabc637ade3d	\N	e4791d20-e5a6-4f07-87c8-8989898989ab	908fa830-7d67-4555-8d3b-a72b20636d44	0b49cd3d-7a15-49d6-a5c4-383d74efef73	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-11 10:34:56.009+05:30	2026-05-11 10:39:40.46+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T05:05:16.568Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-11T05:05:51.303Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T05:06:02.954Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T05:09:40.459Z"}]	2026-05-11 10:35:16.568+05:30	2026-05-11 10:35:51.303+05:30	2026-05-11 10:36:02.954+05:30	2026-05-11 10:39:40.459+05:30	\N
665a1c67-acf6-4f61-b938-c0b2c0ca8d9d	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	28a20cd2-6763-4e0e-917c-a2fcb5e1ce0f	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-11 12:31:08.448+05:30	2026-05-11 12:35:16.91+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T07:04:43.857Z"}, {"status": "packing", "message": "Order packing", "timestamp": "2026-05-11T07:04:48.148Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T07:04:56.174Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T07:05:16.909Z"}]	2026-05-11 12:34:43.857+05:30	2026-05-11 12:34:48.148+05:30	2026-05-11 12:34:56.174+05:30	2026-05-11 12:35:16.909+05:30	\N
99fb082e-0bcd-469c-a43c-45683104ab0b	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	142724e8-a252-49d6-82e8-ed08ef25b2be	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 318, "total": 318, "quantity": 2, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	318	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-11 13:34:14.888+05:30	2026-05-11 21:07:47.95+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-11T15:37:33.329Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-11T15:37:38.844Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-11T15:37:47.950Z"}]	2026-05-11 21:07:33.329+05:30	\N	2026-05-11 21:07:38.844+05:30	2026-05-11 21:07:47.95+05:30	\N
f1950d76-b55b-4d2b-a0d4-6158440cf18c	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	e9fc2e70-50be-4f09-82b9-b713a865baa8	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-14 18:02:31.228+05:30	2026-05-14 18:23:22.187+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-14T12:52:32.505Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-14T12:53:22.186Z"}]	2026-05-14 18:22:32.505+05:30	\N	\N	2026-05-14 18:23:22.186+05:30	\N
fde2e836-7985-4e29-a675-5447b6903035	\N	0893032b-3193-47b5-a046-c0f762670f46	908fa830-7d67-4555-8d3b-a72b20636d44	6e673c22-8502-4e84-ae29-9e26bb08c732	cat_8bd8822dbd89da8f	default_address	[{"cgst": 0, "logo": "", "name": "Classic Veg Burger", "sgst": 0, "price": 159, "total": 159, "quantity": 1, "productId": "prod_c8769bce45cfe3d3", "otherTaxes": 0, "specialRequest": "", "product_catagory": "Burgers", "customizationDetails": []}]	0	159	0	New order from mobile app	"delivery"	pending	cod	\N	delivered	t	2026-05-13 17:48:52.401+05:30	2026-05-13 17:49:44.134+05:30	[{"status": "accepted", "message": "Order accepted", "timestamp": "2026-05-13T12:19:21.882Z"}, {"status": "dispatched", "message": "Order dispatched", "timestamp": "2026-05-13T12:19:33.112Z"}, {"status": "delivered", "message": "Order delivered", "timestamp": "2026-05-13T12:19:44.134Z"}]	2026-05-13 17:49:21.882+05:30	\N	2026-05-13 17:49:33.112+05:30	2026-05-13 17:49:44.134+05:30	\N
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
\.


--
-- Data for Name: PhoneBooks; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."PhoneBooks" (id, "integrationId", "userId", uuid, "createdAt", "updatedAt") FROM stdin;
61886a41-8dfe-4626-a469-8909516ab5b2	908fa830-7d67-4555-8d3b-a72b20636d44	0893032b-3193-47b5-a046-c0f762670f46	b96a8ddf-1274-44da-b19c-1a8faa02cb87	2026-05-11 12:29:29.456+05:30	2026-05-11 12:29:29.456+05:30
9d143338-e979-4bf1-a1e7-44103b30534f	55926449-d540-428f-961e-499be108c51c	0893032b-3193-47b5-a046-c0f762670f46	635f0b48-941a-40cb-9dd5-9a3b09dd0525	2026-05-11 12:29:32.889+05:30	2026-05-11 12:29:32.889+05:30
10a5610c-68df-472f-96c8-e38cf0d3e09c	908fa830-7d67-4555-8d3b-a72b20636d44	e4791d20-e5a6-4f07-87c8-8989898989ab	6383c67d-af84-4cea-8c64-6f514cc66c0b	2026-05-11 12:44:22.179+05:30	2026-05-11 12:44:22.179+05:30
2713dbe0-d9d6-4047-8b0f-5b8527d54e8c	8120904e-9a4e-47d3-812c-4f86c88bab45	0893032b-3193-47b5-a046-c0f762670f46	cbca1d1f-7d7c-4f4f-815f-493fe9499e7a	2026-05-11 13:27:39.843+05:30	2026-05-11 13:27:39.843+05:30
d08d2a11-a6e6-4b9c-b697-792a1ab6aa7f	e28a1344-1a50-48e9-a291-c185ad658482	0893032b-3193-47b5-a046-c0f762670f46	d89bee27-4916-4d4c-aeeb-cf8a2fb21d00	2026-05-11 22:39:25.532+05:30	2026-05-11 22:39:25.532+05:30
2844b5d9-25ff-4fce-b95b-c60527ee3143	276a3e39-06aa-46ab-b73b-774f8192fb11	0893032b-3193-47b5-a046-c0f762670f46	46ada3f7-9675-4882-9bee-3893168294e8	2026-05-16 18:33:58.579+05:30	2026-05-16 18:33:58.579+05:30
fea6282a-9fa6-495b-acc9-bd46e3be46ba	0bfbb67d-2547-4106-a876-ad0db8a8af88	0893032b-3193-47b5-a046-c0f762670f46	20d353db-2f0b-45c9-b88c-f3b9788e86fc	2026-05-18 11:47:29.829+05:30	2026-05-18 11:47:29.829+05:30
e3429288-dbad-4413-b2ad-3c991f91713c	1495f4e0-101d-468a-b2a7-a71ff514d7a2	0893032b-3193-47b5-a046-c0f762670f46	d00dcfff-f4db-4243-bff8-01fe3021a6cf	2026-05-18 11:47:36.719+05:30	2026-05-18 11:47:36.719+05:30
c680b945-cc96-4004-9658-b7babe98f775	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	0893032b-3193-47b5-a046-c0f762670f46	1ec79f88-cd32-4746-a533-61040822004b	2026-05-18 11:47:42.239+05:30	2026-05-18 11:47:42.239+05:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Products" (id, "catalogueId", name, description, price, currency, "imageUrls", sku, quantity, "isActive", "isDeleted", "createdAt", "updatedAt", "discountPrice", category, subcategory, specifications, "integrationId", "dietaryType", "isBestseller", "preparationTime", "variantsConfig", "mongoId", "customizationId") FROM stdin;
prod_66dcb738fcdf783b	cat_99cca0524609a55e	Mango Smoothie	Thick blended mango smoothie with milk and ice cream.	149	INR	["https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?q=80&w=600&auto=format&fit=crop"]	BV-103	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Smoothies	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_8cfa157b84d40b72	cat_99cca0524609a55e	Virgin Mojito	Refreshing mint and lime drink.	129	INR	["https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=600&auto=format&fit=crop"]	BV-104	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Mocktails	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_a293b7a4a8b5cd2c	cat_99cca0524609a55e	Coca Cola 500ml	Regular Coke bottle chilled.	45	INR	["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop"]	BV-105	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Soft Drinks	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_c8769bce45cfe3d3	cat_8bd8822dbd89da8f	Classic Veg Burger	Tasty veggie burger with lettuce and special sauce.	159	INR	["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"]	BRG-001	94	t	f	2026-05-10 15:16:45.939+05:30	2026-05-14 18:02:31.231+05:30	0	Burgers	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
48e43316-6a65-4493-9695-191ec98b4144	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Spinach (250g)	Freshly harvested organic baby spinach leaves, pre-washed.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-001	80	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	41	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
983546ab-aae3-4c06-aa27-c35a148931a6	01c56244-fde9-4372-b2fc-da4288f161b7	Hydroponic Butterhead Lettuce (1 Pc)	Crisp, hydroponically grown butterhead lettuce, rich in flavor.	99	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-002	30	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	89	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
prod_2056c34994815b36	cat_8bd8822dbd89da8f	Margherita Pizza	Double cheese loaded freshly baked pizza.	349	INR	["https://images.unsplash.com/photo-1604068549290-dea0e4a30536?q=80&w=600&auto=format&fit=crop"]	PZA-002	99	t	f	2026-05-10 15:16:45.939+05:30	2026-05-11 11:07:17.201+05:30	0	Pizza	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_393f23f975b22326	cat_8bd8822dbd89da8f	Peri Peri Fries	Crispy golden fries dusted with spicy peri peri powder.	99	INR	["https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop"]	SD-003	100	t	f	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	0	Sides	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	non-veg	t	15	[]	\N	\N
prod_8c0e42a6419dcdf6	cat_8bd8822dbd89da8f	Grilled Chicken Sandwich	Freshly grilled chicken loaded with cheese and mayo.	210	INR	["https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop"]	SDW-004	100	t	f	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	0	Sandwich	\N	{"foodType": "Non Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_39151eafa772e0cc	cat_8bd8822dbd89da8f	Choco Lava Cake	Molten hot chocolate filling inside gooey cake.	120	INR	["https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop"]	DST-005	100	t	f	2026-05-10 15:16:45.939+05:30	2026-05-10 15:16:45.939+05:30	0	Desserts	\N	{"foodType": "Egg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_8c85e274fc17b846	cat_99cca0524609a55e	Fresh Lime Soda	Chilled lime soda with salt or sugar.	79	INR	["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop"]	BV-101	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Mocktails	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
prod_b30cb253310703e8	cat_99cca0524609a55e	Iced Caramel Macchiato	Rich espresso with caramel drizzle served over ice.	189	INR	["https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=600&auto=format&fit=crop"]	BV-102	250	t	f	2026-05-10 15:21:09.531+05:30	2026-05-10 15:21:09.531+05:30	0	Coffee	\N	{"foodType": "Veg"}	908fa830-7d67-4555-8d3b-a72b20636d44	veg	f	15	[]	\N	\N
88c9de91-5dee-4d9a-8ded-bb24a2b1cf62	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Coriander Bunch (100g)	Bright green, highly aromatic coriander leaves.	15	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-003	150	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	14	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
46d421f3-6ffa-4005-b79f-14b8a4b47113	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Mint Leaves (100g)	Peppery, refreshing mint leaves perfect for teas and chutneys.	20	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-004	120	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	18	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
3ce8abb9-8106-4994-887c-01cb036f79ee	01c56244-fde9-4372-b2fc-da4288f161b7	Aromatic Sweet Basil (50g)	Fresh Italian sweet basil leaves, perfect for pesto.	40	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-005	45	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	36	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
e08aa923-7004-4f43-ab2c-b1bf829c467e	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Rosemary (30g)	Woody, fragrant fresh rosemary sprigs for roasting.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-006	25	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
2753d35a-6659-4cfe-ae3f-52ae48646faa	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Thyme (30g)	Delicate, earthy thyme sprigs perfect for savory dishes.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-007	25	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
13ab6beb-2695-42a7-b9c6-3fe9d7dadc6a	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Curry Leaves (50g)	Highly aromatic curry leaves, key to South Indian tempering.	12	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-008	180	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	11	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
c5813f0c-916d-4ea5-88ed-7a89d173ea44	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Spring Onion Bunch (250g)	Crisp green shoots with mild white bulbs.	35	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-009	70	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	32	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
23d554f8-eede-4b1d-89b8-314a4bb1e166	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Curly Kale (150g)	Nutrient-rich, dark curly green kale leaves.	80	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-010	40	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
15f50f00-1202-4ea2-bc36-834201fdb1a9	01c56244-fde9-4372-b2fc-da4288f161b7	Country Red Tomatoes (1kg)	Juicy, vine-ripened local red tomatoes.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-011	200	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	54	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
1887689e-788b-470f-b3ba-24694f16d8ba	01c56244-fde9-4372-b2fc-da4288f161b7	English Cucumber (500g)	Crisp, seedless English greenhouse cucumbers.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-012	90	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	41	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
e76dae97-c6d5-4261-afa5-7c41ebceca61	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Carrots (500g)	Sweet, earthy orange organic carrots.	55	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-013	110	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	50	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
03741cef-92a3-4bce-afe5-f59cf39c96bf	01c56244-fde9-4372-b2fc-da4288f161b7	Red Beetroots (500g)	Deep red, earthy and nutrient-dense beetroots.	35	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-014	85	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	32	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
612fb5ef-777f-4c8b-97ce-5b7d9ddd54bd	01c56244-fde9-4372-b2fc-da4288f161b7	Premium Jyoti Potatoes (1kg)	High-quality earthy Jyoti baking potatoes.	40	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-015	300	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	36	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
f2ae9647-0ebe-43c2-80ea-0cc7ef9a0851	01c56244-fde9-4372-b2fc-da4288f161b7	Nasik Red Onions (1kg)	Pungent, sweet premium red onions from Nasik.	50	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-016	400	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	45	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
e1e7f306-f617-4597-ad3b-035da654efa4	01c56244-fde9-4372-b2fc-da4288f161b7	Organic White Garlic (200g)	Pungent, strong local organic white garlic cloves.	70	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-017	150	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	63	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
c88fdcb9-1e69-4b14-8f7d-1ac7e2d08ffb	01c56244-fde9-4372-b2fc-da4288f161b7	Earthy Ginger (250g)	Fresh, spicy ginger roots with thin skin.	65	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-018	130	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	59	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
9ff1f7cd-8d6e-4e01-a6b7-8072827b6311	01c56244-fde9-4372-b2fc-da4288f161b7	Spicy Green Chillies (100g)	Hot, slender green chillies, freshly picked.	18	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-019	160	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	16	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
94419eae-b797-4a93-a2bc-20c62f44bfeb	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Lemon (Pack of 4)	Juicy, zesty yellow lemons rich in vitamin C.	25	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-020	140	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	23	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
eab31106-ef39-4f5f-a4c5-a0098927d218	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Zucchini Green (500g)	Tender, mild green summer squash.	85	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-021	55	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	77	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
1f61107e-ed79-4faf-98f8-94ab17522eed	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Zucchini Yellow (500g)	Vibrant yellow, sweet summer zucchini.	95	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-022	45	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	86	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
a7568eec-1526-4468-9d99-239f4ab165a8	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Crown Broccoli (1 Pc)	Crisp green broccoli crowns, packed with fiber.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-023	65	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	81	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
bb3dd6ef-1c2b-488e-86b5-ba289fce39a6	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Red Cabbage (500g)	Crisp, colorful red/purple cabbage head.	65	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-024	40	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	59	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
614759f2-c311-4840-a538-2d72511b311c	01c56244-fde9-4372-b2fc-da4288f161b7	Sweet Cherry Tomatoes (250g)	Bite-sized, incredibly sweet red cherry tomatoes.	80	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-025	50	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
decd258f-baf4-4121-a621-c9b4cba8355d	01c56244-fde9-4372-b2fc-da4288f161b7	Button Mushrooms (200g Box)	Earthy, fresh white button mushrooms.	60	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-026	85	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	54	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
fcd8c167-284f-4007-be23-d5521741c3cd	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Shiitake Mushrooms (100g)	Fragrant, savory shiitake mushrooms.	180	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-027	20	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	162	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
75df3049-253a-4f00-b539-cb46343cdc37	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Green Asparagus (250g)	Tender, young green asparagus spears.	220	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-028	25	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	198	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
ae1997cf-4051-4e22-952f-44b075b977dc	01c56244-fde9-4372-b2fc-da4288f161b7	Tender Baby Corn (200g Pack)	Sweet, crisp baby corn cobs.	45	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-029	75	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	41	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
961decb1-2625-472f-bbe7-6d436598e212	01c56244-fde9-4372-b2fc-da4288f161b7	American Sweet Corn (2 Pcs)	Plump, sweet golden corn on the cob.	50	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-030	100	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	45	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
1de393e0-f07b-423f-b9e9-8fa108bee7ed	01c56244-fde9-4372-b2fc-da4288f161b7	Hass Avocado (Pack of 2)	Creamy, rich imported Hass avocados, ready to eat.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-031	40	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
140f4d93-f86d-4001-81cd-807db6c91218	01c56244-fde9-4372-b2fc-da4288f161b7	Royal Gala Red Apples (4 Pcs)	Crisp, sweet, and lightly striped red apples.	180	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-032	95	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	162	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
811f7724-bac9-4c1f-bfc0-cb5e882fe848	01c56244-fde9-4372-b2fc-da4288f161b7	Green Granny Smith Apples (4 Pcs)	Tart, crisp green apples perfect for baking/juicing.	220	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-033	60	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	198	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
84352b7a-a430-4e47-bbcc-0704f7d6d504	01c56244-fde9-4372-b2fc-da4288f161b7	Premium Alphonso Mangoes (6 Pcs)	King of Mangoes, sweet, fiberless rich pulp.	799	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-034	30	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	719	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
d6e973b0-c5df-4f57-be11-889f710af814	01c56244-fde9-4372-b2fc-da4288f161b7	Robusta Bananas (1 Dozen)	Sweet, ripe and energizing yellow bananas.	70	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-035	180	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	63	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
368f3e0b-b3f1-41d8-9f67-a6c64f2d9d50	01c56244-fde9-4372-b2fc-da4288f161b7	Sweet Papaya (1 Pc / ~1.2kg)	Ripe, orange-fleshed sweet local papaya.	80	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-036	70	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	72	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
28e34383-33b4-4610-9d82-9837f6846c0a	01c56244-fde9-4372-b2fc-da4288f161b7	Kabul Ruby Pomegranate (2 Pcs)	Large, dark red pomegranate packed with juicy arils.	190	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-037	80	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	171	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
11ff6a04-0e7d-4845-aa6a-e33f7c4eb9d3	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Kiwi Fruit (Pack of 3)	Zesty, emerald green kiwi fruits with black seeds.	99	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-038	110	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	89	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
a8e80036-565d-4ae1-8931-a98103a88996	01c56244-fde9-4372-b2fc-da4288f161b7	Red Dragon Fruit (1 Pc)	Exotic, vibrant pink flesh dragon fruit, sweet taste.	130	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-039	55	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	117	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
bd21a79b-b45a-4b13-805d-dafcf26808d1	01c56244-fde9-4372-b2fc-da4288f161b7	Valencia Oranges (1kg)	Juicy, sweet oranges perfect for squeezing.	160	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-040	90	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	144	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
035323b1-de34-4847-8d5f-5cd3fdc85711	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Strawberries (200g Box)	Sweet, crimson strawberries grown in Mahabaleshwar.	149	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-041	45	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	134	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
9a24f1f8-5301-4c7f-9094-bdc9075d402b	01c56244-fde9-4372-b2fc-da4288f161b7	Imported Blueberries (125g Cup)	Plump, antioxidant-rich dark blue berries.	249	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-042	50	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	224	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
a51a4059-659d-4e37-96e3-929704db7536	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Raspberries (125g Cup)	Tangy, soft red raspberries.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-043	25	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
2c96507b-5e65-4f1a-b105-300e61e0084d	01c56244-fde9-4372-b2fc-da4288f161b7	Fresh Blackberries (125g Cup)	Sweet, glossy deep black berries.	299	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-044	20	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	269	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
7c0d743e-463b-4a62-879c-6e35fd296666	01c56244-fde9-4372-b2fc-da4288f161b7	Exotic Passion Fruit (Pack of 2)	Tart, aromatic, gelatinous yellow passion fruit.	120	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-045	35	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	108	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
36d9ce76-1b5e-46de-856d-725123e8ebea	01c56244-fde9-4372-b2fc-da4288f161b7	Imported Red Cherries (250g)	Sweet, dark red juicy premium table cherries.	450	INR	["https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300"]	FGO-FRU-046	15	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	405	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
8c5fa83b-ef35-4b7f-a799-45ed383c23fa	01c56244-fde9-4372-b2fc-da4288f161b7	Hydroponic Romaine Lettuce (1 Pc)	Crisp, elongated leaves perfect for Caesar Salad.	110	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-047	30	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	99	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
d1aec208-a19f-4ad5-a3b8-fa9afb13c502	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Bell Peppers Yellow (250g)	Sweet, bright yellow sweet bell pepper.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-048	60	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	81	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
b4ed1af1-0c74-4d38-aba8-5e86d98c649d	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Bell Peppers Red (250g)	Thick, sweet, bright red bell pepper.	90	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-049	60	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	81	\N	\N	{"unit": "g"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
513e3287-3c0c-4ff9-b6b9-8bf692631602	01c56244-fde9-4372-b2fc-da4288f161b7	Organic Cauliflower (1 Pc)	Tight, white cauliflower curd surrounded by green leaves.	50	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	FGO-VEG-050	100	t	f	2026-05-18 09:53:26.404+05:30	2026-05-18 09:53:26.404+05:30	45	\N	\N	{"unit": "Pc"}	0bfbb67d-2547-4106-a876-ad0db8a8af88	veg	f	15	[]	\N	\N
21540815-e6ca-4a37-87f3-20c282cc3797	42c023ee-8378-48be-a641-5b13a6fba3cd	Aged Parmigiano Reggiano (200g)	Aged for 24 months, rich, granular, and nutty Italian cheese.	490	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-001	40	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	441	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
42bd30b1-7511-4a48-a186-5eb3cdab43ee	42c023ee-8378-48be-a641-5b13a6fba3cd	Mature English Cheddar (150g)	Sharp, crumbly aged English farmhouse cheddar cheese.	320	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-002	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	288	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
daae1355-316a-4996-a61a-b12407287d04	42c023ee-8378-48be-a641-5b13a6fba3cd	Dutch Gouda Cheese Wheel (200g)	Creamy, mild semi-hard yellow cheese from Holland.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-003	45	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
c5d42368-8bf8-4980-a3cb-406143daee35	42c023ee-8378-48be-a641-5b13a6fba3cd	French Brie Double Cream (125g)	Soft-ripened, buttery, and incredibly creamy cheese.	380	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-004	30	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	342	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
062513e2-53bf-4b68-90ba-3423bc2901d9	42c023ee-8378-48be-a641-5b13a6fba3cd	French Camembert (250g)	Rich, earthy, soft-ripened cow's milk cheese.	420	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-005	25	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	378	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
d30b2d82-184f-4950-bb70-f37645f8123a	42c023ee-8378-48be-a641-5b13a6fba3cd	Mozzarella Di Bufala Campana (125g)	Fresh buffalo mozzarella balls in brine, soft and milky.	280	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-006	35	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	252	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
59d6d6e9-5e3f-4d47-984f-e99f0b0b3d93	42c023ee-8378-48be-a641-5b13a6fba3cd	Traditional Greek Feta (200g)	Crumbly, tangy sheep and goat milk feta cheese in brine.	250	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-007	60	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	225	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
0ce1e921-0bfd-49cd-83c1-7ab34b2b4e40	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Gorgonzola Blue Cheese (150g)	Veined blue cheese, buttery, crumbly, and sharp flavor.	390	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-008	20	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	351	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
95b35da8-8d2b-4a95-b4bb-81698e75c9d8	42c023ee-8378-48be-a641-5b13a6fba3cd	Fresh Italian Ricotta (200g)	Creamy, light, and mildly sweet whey cheese.	180	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-009	40	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
ce60e012-65e6-47ab-b16c-6f156ca0e630	42c023ee-8378-48be-a641-5b13a6fba3cd	Premium Mascarpone (250g)	Rich Italian double-cream cheese, essential for Tiramisu.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-010	35	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
25a45ccf-c724-46e8-9d76-3fad89316a23	42c023ee-8378-48be-a641-5b13a6fba3cd	Bronze-Cut Penne Rigate (500g)	Rough textured artisanal penne, absorbs sauce perfectly.	175	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-011	100	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	158	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
f520ebcc-6a19-46f7-8b8e-d368110011e4	42c023ee-8378-48be-a641-5b13a6fba3cd	Artisanal Bronze-Cut Spaghetti (500g)	Long, slow-dried Italian durum wheat spaghetti.	175	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-012	120	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	158	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
a8a90577-a1e0-4753-839c-901b0a5c4974	42c023ee-8378-48be-a641-5b13a6fba3cd	Durum Wheat Fusilli (500g)	Spiraled pasta shapes, ideal for heavy cream/meat sauces.	160	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-013	90	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	144	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
8f0b7b9b-a093-4842-bd8c-f0ec81133fbd	42c023ee-8378-48be-a641-5b13a6fba3cd	Bronze-Cut Farfalle (500g)	Butterfly/Bowtie-shaped classic Italian dry pasta.	180	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-014	80	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
9aaf9f61-f5a3-4786-9451-5f4439534253	42c023ee-8378-48be-a641-5b13a6fba3cd	Tuscan Durum Wheat Fettuccine (500g)	Ribbon-shaped pasta, superb for Alfredo/carbonara.	195	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-015	70	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	176	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
c53e20dd-c31f-48f9-b3de-ebf035826063	42c023ee-8378-48be-a641-5b13a6fba3cd	Classic Lasagna Sheets (500g Box)	Flat pasta sheets ready to oven bake with cheese.	210	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-016	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	189	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
a4be4e48-745e-40dc-9de2-316095fe5f33	42c023ee-8378-48be-a641-5b13a6fba3cd	Arborio Rice for Risotto (1kg)	High starch round grain rice, makes risottos super creamy.	350	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-017	65	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	315	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
913c8f85-da11-4e49-b080-ecec37bb3d15	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Royal White Quinoa (500g)	Nutrient-rich, gluten-free complete plant protein.	240	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-018	85	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	216	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
0e6eb79b-f817-4485-ab8e-1d8321c69bf9	42c023ee-8378-48be-a641-5b13a6fba3cd	French Couscous (500g Pack)	Steamed semolina granules, light and fluffy.	190	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-019	75	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	171	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
63b47fd1-99d3-4eb9-9078-711cc19d7686	42c023ee-8378-48be-a641-5b13a6fba3cd	Stone-Ground Italian Polenta (500g)	Coarse yellow cornmeal, rich and comforting.	180	INR	["https://images.unsplash.com/photo-1621961475762-e753a3d94d4f?w=300"]	TGP-PST-020	45	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
9f796a93-3c1b-47bd-b90b-c46c3e61c251	42c023ee-8378-48be-a641-5b13a6fba3cd	Extra Virgin Olive Oil (500ml)	Cold pressed, single source Italian olives, peppery finish.	899	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-021	80	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	809	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
3e113545-2db9-4ebf-aaba-04fb8d46524c	42c023ee-8378-48be-a641-5b13a6fba3cd	White Truffle Infused Olive Oil (250ml)	Vibrant EVOO infused with premium white truffle aroma.	1499	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-022	15	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	1349	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
8e53a4b1-f192-469a-b819-68c7accf21d9	42c023ee-8378-48be-a641-5b13a6fba3cd	Balsamic Vinegar of Modena IGP (250ml)	Aged in wooden casks, sweet, dark, syrup-like glaze.	450	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-023	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	405	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
94c7c2ae-8897-48a7-83d2-89b82257cb51	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Apple Cider Vinegar ACV (500ml)	With "Mother", raw, unfiltered, healthy tonic.	280	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-024	95	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	252	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
466ecedd-ca79-47ff-96cb-24ae2935893e	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Red Wine Vinegar (500ml)	Aged red wine vinegar, great for salad vinaigrettes.	220	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-025	60	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	198	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
d818371e-3ae1-49c0-b79f-b138a21a254d	42c023ee-8378-48be-a641-5b13a6fba3cd	Pure Cold Pressed Avocado Oil (250ml)	High smoke point oil, rich in monounsaturated fats.	650	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-026	30	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	585	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
e20be503-1bc0-4020-b8d8-48658fa69cda	42c023ee-8378-48be-a641-5b13a6fba3cd	Toasted Sesame Oil (250ml)	Nutty, highly aromatic oil for Asian stir-fry recipes.	190	INR	["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300"]	TGP-OIL-027	70	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	171	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
f703f1a1-14c0-4f78-8b55-5e5f51fa19b0	42c023ee-8378-48be-a641-5b13a6fba3cd	Gourmet Basil Pesto (190g Jar)	Made with fresh basil, pine nuts, garlic, and Grana Padano.	240	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-028	55	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	216	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
c9bd6a7c-5abb-4de5-ac7a-0b135b7d9029	42c023ee-8378-48be-a641-5b13a6fba3cd	Slow Cooked Marinara Sauce (350g)	San Marzano tomatoes simmered with garlic, basil, and EVOO.	199	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-029	75	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	179	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
d5d41c5f-56f8-4f04-b03e-0b68c1defa89	42c023ee-8378-48be-a641-5b13a6fba3cd	Creamy Classic Alfredo Sauce (350g)	Rich cream sauce made with butter and aged parmesan.	220	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-030	65	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
ae9ce4ad-3b73-4494-b836-a617888429f1	42c023ee-8378-48be-a641-5b13a6fba3cd	French Dijon Mustard (200g)	Smooth, sharp, traditional French mustard from Dijon.	180	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-031	85	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
bafa03c5-968a-49e5-98c7-c250d09277e2	42c023ee-8378-48be-a641-5b13a6fba3cd	Whole Grain Mustard (200g)	Coarse, textured mustard seeds in white wine.	190	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-032	75	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	171	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
7972a5df-83d6-4d18-8c7a-90adca20297d	42c023ee-8378-48be-a641-5b13a6fba3cd	Real Eggless Truffle Mayo (200g)	Creamy vegan mayo infused with black summer truffles.	160	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-033	90	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	144	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
9f879303-c700-42ee-a926-3b4f694f13e8	42c023ee-8378-48be-a641-5b13a6fba3cd	Sriracha Chilli Hot Sauce (480g)	Traditional spicy sun-ripened chili garlic paste.	299	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-034	110	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	269	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
8a708395-2e9a-461f-b315-448b1284faf0	42c023ee-8378-48be-a641-5b13a6fba3cd	Hickory Smoked BBQ Sauce (350g)	Tangy, sweet sauce with deep woodsmoke flavor.	180	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-035	120	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	162	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
6a2f9b94-8d29-4212-9538-53f8b3999671	42c023ee-8378-48be-a641-5b13a6fba3cd	Dark Chocolate Bark w/ Sea Salt (100g)	70% cacao dark chocolate shards sprinkled with Maldon sea salt.	220	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-036	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
7102ae86-6919-4a1a-b56d-4b81280965a4	42c023ee-8378-48be-a641-5b13a6fba3cd	Salted Butter Caramel Spread (250g)	French-style sweet caramel with Guerande fleur de sel.	299	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-037	40	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	269	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
dd1be935-3427-4077-bb04-82771f4574c8	42c023ee-8378-48be-a641-5b13a6fba3cd	Macarons Assortment (Pack of 6)	Assorted flavors: Pistachio, Raspberry, Chocolate, Lemon.	450	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-038	20	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	405	\N	\N	{"unit": "Pc"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
ad94fa70-1210-4849-a06f-f9bf91eead69	42c023ee-8378-48be-a641-5b13a6fba3cd	Italian Roasted Hazelnut Spread (350g)	High hazelnut content cocoa spread, dairy-free.	349	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-039	60	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	314	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
25262c7d-db97-42ea-88bb-12387e2b0b5f	42c023ee-8378-48be-a641-5b13a6fba3cd	Organic Pure Maple Syrup (250ml)	Grade A golden maple syrup imported from Canada.	699	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-040	35	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	629	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
87e613ff-a155-4f98-bd32-be105f1d606b	42c023ee-8378-48be-a641-5b13a6fba3cd	Lotus Biscoff Spread (400g)	Original caramelized speculoos cookie butter spread.	450	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-041	90	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	405	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
fe626820-c289-48cd-a68b-cd313e75c9d2	42c023ee-8378-48be-a641-5b13a6fba3cd	Sourdough Artisanal Crackers (150g)	Thin, crispy crackers, perfect for cheese platters.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-042	100	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	108	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
d18d1698-dbd0-4802-b8a6-cf49ee38b4da	42c023ee-8378-48be-a641-5b13a6fba3cd	Stuffed Green Olives w/ Pimento (300g)	Spanish Queen green olives stuffed with sweet pimento.	220	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-043	80	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	198	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
99d5613f-404b-4286-a070-e775b84048e5	42c023ee-8378-48be-a641-5b13a6fba3cd	Kalamata Whole Dark Olives (300g)	Sun-ripened Greek dark purple olives in red wine vinegar.	240	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-044	70	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	216	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
741aa3c9-47e0-4372-bbff-8ed4ef302f6d	42c023ee-8378-48be-a641-5b13a6fba3cd	Gourmet Wild Capers in Brine (100g)	Tiny, tangy, pickled flower buds from the Mediterranean.	150	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-045	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	135	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
281a864d-9cc1-4117-9ead-f0baec644323	42c023ee-8378-48be-a641-5b13a6fba3cd	Artisanal Herb Cheese Straws (100g)	Crispy puff pastry straws baked with cheddar and rosemary.	99	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	TGP-SNC-046	100	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	89	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
83aa420d-9750-4b2c-a980-3a8d6b0b318f	42c023ee-8378-48be-a641-5b13a6fba3cd	White Wine Vinegar (500ml)	Tangy, clear white wine vinegar for fine dressings.	210	INR	["https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300"]	TGP-SAU-047	50	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	189	\N	\N	{"unit": "ml"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
23eec2c6-c3a2-4b90-ba05-3fe827fdaac0	42c023ee-8378-48be-a641-5b13a6fba3cd	Halloumi Cyprus Grilling Cheese (200g)	High melting point cheese, perfect to pan-sear.	390	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-048	30	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	351	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
8e3d98bb-92a0-4d48-8290-1116065cdc74	42c023ee-8378-48be-a641-5b13a6fba3cd	Aged Spanish Manchego (150g)	Firm sheep's milk cheese aged for 6 months.	490	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-049	25	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	441	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
59c3df8b-05c0-4af4-a812-cd73862298ab	42c023ee-8378-48be-a641-5b13a6fba3cd	Mascarpone Double Cream (250g)	Velvety, rich Italian double cream cheese.	290	INR	["https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300"]	TGP-CHS-050	40	t	f	2026-05-18 09:53:26.423+05:30	2026-05-18 09:53:26.423+05:30	261	\N	\N	{"unit": "g"}	8bc5c098-3fe2-4389-9b99-7a0cd8bf2fce	veg	f	15	[]	\N	\N
2ab5734d-9a61-4281-b4b3-75bb601bccb7	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Turmeric Powder (200g)	Pure, high-curcumin ground turmeric from Salem.	45	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-001	300	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	41	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
dfb75223-7333-4c15-9da8-eacde5d22f56	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kashmiri Red Chilli Powder (200g)	Mildly spicy chilli powder, gives vibrant red color.	80	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-002	250	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	72	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
5219a787-8553-4722-8fee-e6ad9a66704a	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Coriander Powder (200g)	Ground coriander seeds, aromatic and fresh.	40	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-003	280	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	36	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
08a48849-09a9-48b8-bb7d-dfb5edb53a64	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Roasted Cumin Powder (100g)	Dry-roasted and finely ground cumin seeds.	50	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-004	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	45	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
b50d641a-1505-4443-b3a1-84e136d01ad3	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Authentic Garam Masala (100g)	Blend of 12 roasted whole aromatic spices.	65	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-005	200	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	59	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
0462bfa3-e614-45c0-88d2-106065608b99	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cumin Seeds / Jeera (100g)	Highly aromatic cumin seeds for tempering.	55	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-006	220	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	50	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
4c0c0010-4242-43b0-bdcf-b067659d1b63	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Black Mustard Seeds / Rai (100g)	Pungent black mustard seeds, high quality.	20	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-007	350	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	18	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
617b2cc1-57c5-4ba5-becc-354563137e19	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fennel Seeds / Saunf (100g)	Sweet, anise-like seeds, digestive aid.	30	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-008	180	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	27	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
6862e886-5287-4f54-82fc-571296d4ecde	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fenugreek Seeds / Methi (100g)	Bitter-sweet seeds, essential for pickles/curries.	25	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-009	190	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	23	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
204b7c8a-c404-4b0a-a0bc-947848bdb6c9	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Strong Asafoetida / Hing (50g)	Compounded, highly aromatic asafoetida powder.	90	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-SPC-010	120	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
25dd45c9-1d01-4905-9e04-302b9917e6c7	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Black Cardamom (50g)	Smoky, intensely warm whole black cardamom pods.	95	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-011	100	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	86	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
2b01709e-6265-4f6a-8f4e-ba928e0c7f22	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Green Cardamom (50g)	Highly fragrant, premium bold green cardamom.	160	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-012	120	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	144	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
cba3848b-3dd2-4c21-ae4f-75683e0df795	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cloves / Laung (50g)	Warm, highly aromatic whole cloves buds.	75	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-013	140	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
3678a07f-f9d7-459a-8e40-8c9b203d4a07	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Cinnamon Sticks / Dalchini (100g)	Sweet, woody whole cassia cinnamon bark.	110	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-014	90	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	99	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
69d54315-d80d-49bb-9dad-4be876b2b8f1	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Star Anise (50g)	Licorice-flavored star shaped pods.	80	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-015	80	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	72	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
befccf8d-12e4-4042-ad82-d785ec81ab18	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Bay Leaves / Tejpatta (25g)	Sun dried, highly aromatic bay leaves.	25	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-016	200	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	23	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
f8d2c57a-efbd-4689-9124-1366c2ca48e4	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Black Peppercorns (100g)	Pungent, hot black peppercorns from Malabar.	99	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-017	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	89	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
e7b3c2b4-4ffa-47f6-828f-7d15075da925	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Nutmeg / Jaiphal (Pack of 3)	Sweet, highly fragrant whole nutmeg seeds.	40	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-018	100	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	36	\N	\N	{"unit": "Pc"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
0432bfcf-70fc-4a5e-94f4-565141b82ec7	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Mace / Javitri Whole (20g)	Delicate, lace-like warm spice overlaying nutmeg.	120	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-019	50	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	108	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
c8a9d226-46e6-4c54-b0bd-542184929a47	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kashmiri Saffron / Kesar (1g)	Grade A premium dark red saffron threads.	350	INR	["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300"]	SHC-WSP-020	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	315	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
2b93a344-e14c-41a9-b052-e4cbc64e8a29	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Unpolished Toor Dal / Arhar (1kg)	High-protein unpolished split pigeon peas.	165	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-021	300	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	149	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
8c4564cb-4400-4141-ae5f-78d5676737af	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Whole Moong Sabut (1kg)	Nutrient-rich, premium whole green mung beans.	140	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-022	250	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	126	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
7ccc310c-f83b-49c3-acbb-fdcf786b43a3	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Moong Dal Dhuli (1kg)	Husked and split green gram, easy to digest.	155	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-023	220	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	140	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
9197de89-e90d-4f9e-b26c-d1e81d9dd848	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Chana Dal (1kg)	Sweet, nutty unpolished split Bengal gram.	110	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-024	280	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	99	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
9452c88d-cc06-4bef-87b9-6c31d4d1bfb3	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Urad Dal Whole Black (1kg)	Whole black gram, essential for Dal Makhani.	145	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-025	200	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	131	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
0c83538f-1198-4290-a21f-a54439fe1113	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Rajma Chitra / Kidney Beans (1kg)	Spotted kidney beans, cook up super soft.	170	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-026	180	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	153	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
ab21abba-7581-46d1-9f8c-ad3637b49556	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kabuli Chana / White Chickpeas (1kg)	Bold, creamy white chickpeas, perfect for Chole.	150	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-027	250	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	135	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
8568a8f0-5d71-45e0-bfb2-70507c909d6f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Kala Chana / Black Chickpeas (1kg)	High-fiber, nutritious whole black chickpeas.	90	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-028	300	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
6438258d-eb1b-42c7-928a-db5a3cd5d949	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Split Masoor Dal / Red Lentils (1kg)	Fast cooking red split lentils.	115	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-029	240	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	104	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
c93509de-0bbe-4e14-b4f5-6488b1a96a25	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Green Peas Dried (500g)	Nutrient-rich dried green peas.	60	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-DAL-030	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	54	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
34fadecc-c1e2-4aaa-bff2-091e29c4342f	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Sharbati Whole Wheat Atta (5kg)	Stone-ground wheat flour from Sharbati grains.	299	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-031	400	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	269	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
9913b6b8-82e7-453b-a3d4-a0a91cd73954	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Maida Fine Wheat Flour (1kg)	Superfine wheat flour for baking and flatbreads.	50	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-032	200	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	45	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
6168a599-1cfb-487f-8afa-f00b97d144b7	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Fine Sooji / Semolina (1kg)	Coarse semolina, excellent for Upma/Halwa.	55	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-033	180	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	50	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
4d8ab4eb-8930-41c9-910a-b6414c6484b4	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Pure Besan / Gram Flour (1kg)	Fine ground Bengal gram flour, gluten-free.	95	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-034	250	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	86	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
0946acba-2d7b-4954-928e-844a49c624ab	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Ragi Flour (1kg)	Finger millet flour, incredibly rich in calcium.	75	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-035	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
9478b9f7-8e1d-49fb-87c8-4fde3b694f0c	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Bajra Flour / Pearl Millet (1kg)	Traditional nutrient-rich pearl millet flour.	70	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-036	120	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	63	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
1c178c11-25a1-44f0-9fb3-9f6e14329eee	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Thick Poha / Flattened Rice (500g)	Flattened rice flakes, ideal for breakfast Poha.	40	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-037	220	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	36	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
e542d4af-e48a-4c2a-8cfe-dfac12ddd149	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Sabudana Large / Tapioca Pearls (500g)	Tapioca starch pearls, essential for fasts/Khichdi.	75	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-038	140	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	68	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
ca333faa-14dd-4ed1-8f19-f81edca898ed	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Wheat Dalia / Broken Wheat (500g)	Fiber-rich broken wheat for healthy porridge.	45	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-039	160	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	41	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
51240f41-b566-4bfc-8ce4-8cbbe57b1e5e	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Traditional Basmati Rice (5kg)	Extra long grain, highly fragrant aged basmati rice.	720	INR	["https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=300"]	SHC-FLR-040	100	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	648	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
f6dc21a2-8a9c-4150-be62-ed551a20bb6d	303063e3-82e1-4cc4-b58c-b7801b54c2e3	California Almonds Premium (500g)	Crunchy, sweet, and rich California almonds.	480	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-041	150	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	432	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
69d34825-00d0-4014-b331-0c8f13565ddc	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Whole Cashew Nuts W240 (500g)	Large, premium grade whole cashew nuts.	520	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-042	130	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	468	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
5fbf40ca-3953-483a-b361-e26c08e544ee	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Salted & Roasted Pistachios (250g)	Premium roasted pistachios in shell, lightly salted.	299	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-043	95	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	269	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
e66d7227-2f66-499d-af66-389fedb6e39a	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Chilean Walnut Halves (250g)	Rich, buttery Chilean light walnut kernels.	340	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-044	80	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	306	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
1a68f20a-8ee8-49de-be23-58409163f7b5	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Soft Dried Figs / Anjeer (250g)	Sweet, fibrous round dried figs.	320	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-045	70	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	288	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
32a9177c-267e-4f4b-ada7-33d516a8b067	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Golden Seedless Raisins (250g)	Sweet, plump green raisins dried naturally.	99	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-046	140	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	89	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
acd1d50b-cf26-42a5-b655-46e3214fe20d	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Premium Kimia Dates (500g)	Soft, melt-in-mouth dark black Iranian dates.	280	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-047	110	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	252	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
c89abd6c-f167-491a-bd4b-098f52f5f10d	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Dried Turkish Apricots (250g)	Delectable, tangy orange dried whole apricots.	220	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-048	65	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	198	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
99c6f454-4ca4-4193-a874-9f1f7186ad06	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Chia Seeds (150g)	Antioxidant and omega-3 rich healthy seeds.	90	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-049	120	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	81	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
a1431b88-a049-428d-ad02-2c301a5f9c94	303063e3-82e1-4cc4-b58c-b7801b54c2e3	Organic Flax Seeds (150g)	Nutty seeds packed with dietary fiber.	60	INR	["https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=300"]	SHC-NUT-050	130	t	f	2026-05-18 09:53:26.437+05:30	2026-05-18 09:53:26.437+05:30	54	\N	\N	{"unit": "g"}	1495f4e0-101d-468a-b2a7-a71ff514d7a2	veg	f	15	[]	\N	\N
26e32060-cd45-4bb3-a3fa-084b481edeb8	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Paneer / Cottage Cheese (200g)	Soft, fresh, and creamy cottage cheese block.	90	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-001	120	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	81	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
f0d5abf1-2f7f-4a03-8c00-0deeaee7240b	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Salted Butter (500g)	Classic, delicious salted cream butter.	275	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-002	150	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	248	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
635bcf2b-8200-40f6-afbd-d02ecbafb3bb	15b0d44c-efc7-4255-a6df-6ee823d86292	Processed Cheese Slices (200g)	10 individually wrapped creamy cheese slices.	150	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-003	95	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	135	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
7b954e20-bbf8-4958-bbb8-6f0005988121	15b0d44c-efc7-4255-a6df-6ee823d86292	Sweet Plain Yogurt / Dahi (400g Cup)	Thick, creamy, set pasteurized plain yogurt.	45	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-004	180	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	41	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
c03008b6-aa27-45a3-9b14-7fa1cef3697e	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Unsalted Cooking Butter (100g)	Pure, unsalted butter ideal for baking.	60	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-005	80	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	54	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
8cf1a65e-6646-41fe-82a7-68f05d133661	15b0d44c-efc7-4255-a6df-6ee823d86292	Farm-Fresh Brown Eggs (12 Pcs)	Premium, protein-rich large brown chicken eggs.	160	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-006	100	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	144	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	egg	f	15	[]	\N	\N
4ee57833-c006-404f-b1cf-47a1252464fa	15b0d44c-efc7-4255-a6df-6ee823d86292	Sweet Mango Lassi (250ml Tetrapak)	Refreshing yogurt drink blended with mango pulp.	30	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-007	250	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	27	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
5c891be1-cbe8-45f3-a27b-0714af2a47e9	15b0d44c-efc7-4255-a6df-6ee823d86292	Amul Chocolate Milk (180ml)	Thick, delicious chocolate flavored milk shake.	35	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-008	200	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	32	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
ae9c7a00-67c4-4959-83a0-601c837cd536	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Cream (250ml Pack)	Low fat, smooth dairy fresh cream.	70	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-009	110	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	63	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
53daecb5-f055-4326-9c4c-a1fd8c71f33a	15b0d44c-efc7-4255-a6df-6ee823d86292	Fresh Mozzarella Shredded (150g)	Perfect melting shredded cheese for pizzas.	180	INR	["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=300"]	DNS-DY-010	65	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	162	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
a279f97a-a282-4ab2-a3b4-55505b0c3d47	15b0d44c-efc7-4255-a6df-6ee823d86292	Coca Cola Original (750ml)	Refreshing, sparkling carbonated soft drink.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-011	300	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
fe939dee-b2ff-4df2-9bcf-d17e43517f43	15b0d44c-efc7-4255-a6df-6ee823d86292	Sprite Lemon Lime (750ml)	Crisp, refreshing lemon-lime flavored soda.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-012	280	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
1481853f-0648-4ed0-87f5-4cc80a3cb286	15b0d44c-efc7-4255-a6df-6ee823d86292	Thums Up Strong Soda (750ml)	Strong, spicy, high-fizz cola drink.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-013	350	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	36	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
53964936-284a-4eb3-80a3-e96d6b14c5ee	15b0d44c-efc7-4255-a6df-6ee823d86292	Diet Coke Zero Sugar (300ml Can)	Sugar-free, calorie-free refreshing diet cola.	40	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-014	150	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	36	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
a429d535-79a8-402c-a99f-4be355590646	15b0d44c-efc7-4255-a6df-6ee823d86292	Schweppes Tonic Water (300ml)	Classic carbonated mixer with quinine.	60	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-015	120	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	54	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
a5ffbb1b-af47-482d-b10a-b6ee0d127fbf	15b0d44c-efc7-4255-a6df-6ee823d86292	Schweppes Ginger Ale (300ml)	Bubbling, crisp ginger flavored soda.	60	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-016	120	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	54	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
7c49d1c1-c762-48b3-8541-415519ffd95d	15b0d44c-efc7-4255-a6df-6ee823d86292	Nescafe Gold Instant Coffee (100g)	Rich, smooth roasted premium instant coffee.	350	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-017	85	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	315	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
3977ba29-9293-4485-8e0d-d06cfd3b17f3	15b0d44c-efc7-4255-a6df-6ee823d86292	Taj Mahal Assam Tea (500g)	Premium loose leaf black tea from Assam.	290	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-018	140	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	261	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
75d7c981-9afc-4b46-8697-b747b9c1357f	15b0d44c-efc7-4255-a6df-6ee823d86292	Lipton Green Tea Lemon (100 Bags)	Pure green tea bags infused with natural lemon flavor.	350	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-019	95	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	315	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
9c8f31ff-e0a2-4bd6-9a4d-4d7fff332f18	15b0d44c-efc7-4255-a6df-6ee823d86292	Real Tender Coconut Water (200ml)	Pure, refreshing coconut water in a brick pack.	45	INR	["https://images.unsplash.com/photo-1527960656366-ee2a9998ddb5?w=300"]	DNS-BEV-020	220	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	41	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
6440df2f-2df5-4688-a428-73de8b14e15d	15b0d44c-efc7-4255-a6df-6ee823d86292	Premium Sandwich White Bread (400g)	Soft, sliced fresh white sandwich bread.	45	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-021	150	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	41	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
66b9cbe2-bd86-4e2d-84c5-32f2da28a27a	15b0d44c-efc7-4255-a6df-6ee823d86292	100% Whole Wheat Brown Bread (400g)	Fiber-rich, healthy sliced wheat brown bread.	55	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-022	120	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	50	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
efe408d9-e305-4007-b75d-6cbdfa78e614	15b0d44c-efc7-4255-a6df-6ee823d86292	Multigrain Artisan Bread (400g)	Soft bread topped with oats, flax, and sesame seeds.	65	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-023	80	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	59	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
03b8b689-0dbd-4b2c-99d2-bddda465595b	15b0d44c-efc7-4255-a6df-6ee823d86292	Soft Burger Buns (Pack of 4)	Fresh, fluffy round sesame burger buns.	35	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-024	90	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	32	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
b2836774-a9a9-493f-be73-ed1c802f6500	15b0d44c-efc7-4255-a6df-6ee823d86292	Chocolate Chip Cookies (150g Pack)	Crunchy cookies loaded with rich chocolate chips.	70	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-025	180	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	63	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
a954a286-0fa2-4f27-b2f7-4b173449c7f9	15b0d44c-efc7-4255-a6df-6ee823d86292	Britannia Digestive Biscuits (250g)	High-fiber, crispy whole wheat biscuits.	60	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-026	250	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	54	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
e7903686-85bf-46be-8c4f-d163f884dee9	15b0d44c-efc7-4255-a6df-6ee823d86292	Kelloggs Corn Flakes Original (875g)	Crunchy, toasted flakes of golden corn breakfast cereal.	299	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-027	90	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	269	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
4dfb491f-7513-4103-888f-1b597cfc9c5f	15b0d44c-efc7-4255-a6df-6ee823d86292	Kelloggs Chocos Cereal (375g)	Chocolatey, scoop-shaped crunchy wheat cereal.	180	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-028	110	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	162	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
65e8b8fc-25ca-48ce-ac91-b9eca225d9de	15b0d44c-efc7-4255-a6df-6ee823d86292	Quaker Rolled Oats (1kg)	100% natural whole grain rolled oats.	199	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-029	130	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	179	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
cff0515c-92e4-422d-bf16-22cbe596c4de	15b0d44c-efc7-4255-a6df-6ee823d86292	Kissan Mixed Fruit Jam (500g Jar)	Sweet spread made with 8 real fruits pulp.	170	INR	["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300"]	DNS-BAK-030	140	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	153	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
fc976e68-9266-46c8-9ef8-d8e91f92f867	15b0d44c-efc7-4255-a6df-6ee823d86292	Lays Potato Chips Classic (50g)	Crisp, salted potato chips.	20	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-031	400	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	18	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
04ae3bb1-d65d-47ee-a8e3-972749131a66	15b0d44c-efc7-4255-a6df-6ee823d86292	Maggi 2-Min Masala Noodles (Pack of 6)	Instant noodles with authentic Indian masala spices.	96	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-032	350	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	86	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
791cf458-cf6e-46ef-a1db-be3f0a07dca2	15b0d44c-efc7-4255-a6df-6ee823d86292	Maggi Hot & Sweet Tomato Sauce (1kg)	Tangy, sweet and spicy tomato ketchup.	160	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-033	110	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	144	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
d86cb1b2-e172-4bae-b14f-32cd8781c03a	15b0d44c-efc7-4255-a6df-6ee823d86292	Ching's Schezwan Chutney (250g)	Fiery, garlic-rich schezwan dipping sauce.	85	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-034	180	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	77	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
22969a63-be21-4977-ba87-1edb933becb9	15b0d44c-efc7-4255-a6df-6ee823d86292	Haldirams Roasted Peanut Salted (200g)	Crunchy, roasted split peanuts, lightly salted.	50	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-035	240	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	45	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
7ee6c8d4-3f0d-43da-8dfa-5928f149ed84	15b0d44c-efc7-4255-a6df-6ee823d86292	Act II Popcorn Butter Pepper (3 Pcs)	Instant microwave popcorn, butter pepper flavor.	60	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-036	300	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	54	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
8b93f974-ccf0-4be4-91bc-75dd1ed303c7	15b0d44c-efc7-4255-a6df-6ee823d86292	Real Mixed Fruit Juice (1L)	Pure, refreshing liquid fruit blend.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-037	160	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	99	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
35318cd6-e7a2-4f80-a939-6799019ee90d	15b0d44c-efc7-4255-a6df-6ee823d86292	Haldiram Bhujia Sev (350g)	Crispy, spicy moth bean flour noodles.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	DNS-SNC-038	220	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	99	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
5fcb9b89-9f6f-4cd2-b940-2a735e8739e5	15b0d44c-efc7-4255-a6df-6ee823d86292	Dettol Liquid Hand Wash (200ml)	Antibacterial liquid soap, original pine scent.	99	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-039	200	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	89	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
39799710-f550-40e5-91e5-7421fc6512b0	15b0d44c-efc7-4255-a6df-6ee823d86292	Vim Dishwashing Gel Lemon (500ml)	Concentrated gel, cuts grease with power of lemons.	120	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-040	180	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	108	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
5c9ad027-ced3-46f9-baaf-f91bd033dd3e	15b0d44c-efc7-4255-a6df-6ee823d86292	Harpic Toilet Cleaner Liquid (1L)	Disinfectant toilet bowl cleaner, fresh scent.	195	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-041	150	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	176	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
ca1a0d97-ba35-4881-b707-a8e7b81542f2	15b0d44c-efc7-4255-a6df-6ee823d86292	Lizol Floor Cleaner Citrus (1L)	Disinfectant surface cleaner, citrus fragrance.	185	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-042	160	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	167	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
ea2b0c62-fa8c-47cf-8822-c8a9cadbdbe0	15b0d44c-efc7-4255-a6df-6ee823d86292	Colin Glass & Multi-Surface Spray (500ml)	Shine booster glass and household spray.	105	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-043	130	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	95	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
b86d5894-3648-4a39-a839-7f19066a7ec0	15b0d44c-efc7-4255-a6df-6ee823d86292	OXO Oxodegradable Garbage Bags (30 Pcs)	Medium size black, biodegradable garbage bags.	90	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-044	220	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	81	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
a2c9c61f-8d41-4423-838d-d7254962d753	15b0d44c-efc7-4255-a6df-6ee823d86292	Origami Soft Face Tissues (200 Pulls)	2-ply super soft facial tissue box.	80	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-045	240	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	72	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
26bce148-7e69-4bcb-abc1-e275dbbdf589	15b0d44c-efc7-4255-a6df-6ee823d86292	Surf Excel Matic Liquid Detergent (1L)	Tough stain removing liquid for washing machines.	230	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-046	180	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	207	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
41e187e3-9693-48dd-9411-d97434a20cfb	15b0d44c-efc7-4255-a6df-6ee823d86292	Comfort Fabric Conditioner (1L)	Softens clothes, gives long lasting freshness.	210	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-047	140	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	189	\N	\N	{"unit": "L"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
c7e0ae60-6c23-43b1-ad7a-c588328c6374	15b0d44c-efc7-4255-a6df-6ee823d86292	Savlon Antiseptic Liquid (500ml)	Trusted antiseptic germicide for wound care.	160	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-048	100	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	144	\N	\N	{"unit": "ml"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
226a6909-cc98-4927-827d-448a67a1f987	15b0d44c-efc7-4255-a6df-6ee823d86292	Origami Kitchen Paper Towel (2 Rolls)	Absorbent, strong 2-ply kitchen paper rolls.	95	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-049	120	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	86	\N	\N	{"unit": "Pc"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
9ef179b4-32ed-4964-96a7-b35b86bf0dde	15b0d44c-efc7-4255-a6df-6ee823d86292	Ariel Complete Detergent Powder (1kg)	Deep cleaning laundry washing powder.	190	INR	["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300"]	DNS-HOM-050	250	t	f	2026-05-18 09:53:26.448+05:30	2026-05-18 09:53:26.448+05:30	171	\N	\N	{"unit": "g"}	b62f1b85-31fe-4065-a964-3ce587191c59	veg	f	15	[]	\N	\N
7a70ef57-30ff-4bb3-98af-76714e6709fa	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Barista Almond Milk (1L)	Unsweetened, ultra-creamy almond milk for coffees.	320	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-MLK-001	80	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	288	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
74e01c91-9c23-4edc-b522-8d2071fec10b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Oat Milk Unsweetened (1L)	Dairy-free, gluten-free milk with a natural oat sweetness.	350	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-MLK-002	75	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	315	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
c6aa2631-be40-44fe-a187-5a59b9bee118	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vanilla Soy Milk Organic (1L)	Organic soy milk infused with natural vanilla bean.	180	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-MLK-003	90	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	162	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
ddc1cd68-ffe1-4b79-b0f4-3df38c2c7cb1	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Culinary Thick Coconut Milk (400ml)	Rich, double-extracted coconut milk for cooking.	90	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-MLK-004	140	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	81	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
9a29f13b-d46b-4a83-91cf-bf700144a5c2	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Creamy Cashew Milk (1L)	Silky, dairy-free milk made from raw organic cashews.	380	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-MLK-005	45	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	342	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
42c0e343-9a5e-449d-a94f-f8cd968917dc	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Mozzarella Blocks (200g)	Coconut-oil based vegan mozzarella, melts beautifully.	320	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-006	40	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	288	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
43fc4e54-9ee7-4c26-a6ca-977bf1cf7748	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Cheddar Shreds (200g)	Tangy, sharp plant-based cheddar cheese shreds.	340	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-007	35	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	306	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
3fe76623-de93-4307-8e09-2b16d285d067	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Stone-Ground Smooth Almond Butter (200g)	100% roasted almonds, stone-ground with no added oils.	390	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-008	60	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
4394de22-b5f9-4d0e-a4de-3a25edd4fa63	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Crunchy Dark Roast Peanut Butter (350g)	Slow roasted high-protein peanut butter with chunks.	160	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-009	120	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	144	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
3e868f36-1288-42e7-8379-27f59557350e	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Classic Hummus (200g)	Creamy chickpea puree with organic tahini and olive oil.	180	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-010	70	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	162	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
9d2f825f-f1ff-45d0-854a-e7a121e2b03b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic White Quinoa (1kg)	Gluten-free complete protein white quinoa grains.	450	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-011	100	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	405	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
cd9ce014-7570-433e-82c6-8cd4db411bff	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Tri-Color Quinoa (500g)	Beautiful blend of white, red, and black quinoa.	290	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-012	85	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
caaf5d71-8ff1-4a67-bfdf-b05f792e5c5b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Whole Chia Seeds (250g)	Fiber and Omega-3 rich whole chia seeds.	160	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-013	150	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	144	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
1d1e4e8a-1aea-4c68-8bff-54e0837e82dc	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold-Milled Golden Flax Seeds (250g)	Milled golden flax seeds, ready to mix in smoothies.	120	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-014	110	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
ac351899-901c-440f-89f5-8fac070c13ef	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Pumpkin Seeds (200g)	Shelled pepitas, rich in zinc and magnesium.	180	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-015	140	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	162	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
9e9bd4a8-cf4d-46a2-8838-842ad8678b09	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Roasted Sunflower Seeds (200g)	Lightly roasted, nutty sunflower seed kernels.	140	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-016	120	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	126	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
b1344ee0-500c-48a0-af82-304a3bae785e	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Shelled Hemp Seeds (150g)	Superfood seeds rich in gamma-linolenic acid GLA.	390	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-017	55	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
aa70a625-e30f-4cb0-b61f-c83ff5625a10	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Jumbo Rolled Oats (1kg)	Thick cut, minimally processed rolled oats.	240	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-018	130	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	216	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
c3f7a728-76a5-4077-a694-92ffeb27dd11	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Steel Cut Oats (1kg)	Coarsely chopped oat groats, high fiber breakfast.	260	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-019	95	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	234	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
f8a104cb-ce6f-4dbe-9723-57383eafd8e6	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Buckwheat Groats (500g)	Raw, organic gluten-free buckwheat grains.	190	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-020	80	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	171	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
7cc3d091-8344-4ddb-a922-d169654ab696	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Ceremonial Matcha Green Tea (50g)	Stone ground shade grown green tea powder from Uji, Japan.	890	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-021	25	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	801	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
b536887c-e044-4ff2-ac1f-a9e108080c21	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Spirulina Powder (100g)	Blue-green algae powder, ultimate protein superfood.	350	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-022	60	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	315	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
18145c91-1b17-4500-bf76-c6f0f313eead	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Freeze-Dried Acai Berry (100g)	Pure Brazilian acai berry powder, antioxidant powerhouse.	990	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-023	20	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	891	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
914be448-f536-41c4-bd5f-7c3a4282f1c8	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Golden Turmeric Latte Mix (150g)	Blend of turmeric, black pepper, cinnamon, and ginger.	250	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-024	90	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	225	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
9fe425fd-a1cc-4084-961d-276cf16f12c2	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Chamomile Herbal Tea Bags (25 Bags)	Calming, caffeine-free whole chamomile flower tea.	220	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-025	110	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	198	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
b888e454-fc67-4728-bf9b-c01af8c8d3ff	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Peppermint Herbal Tea (25 Bags)	Cooling, refreshing pure peppermint leaves tea.	220	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-026	100	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	198	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
75cba72e-ad95-49b1-aa55-3803d6e77521	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Dried Hibiscus Flowers (100g)	Tart, ruby-red dried calyces for herbal infusions.	190	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-027	75	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	171	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
9408ea65-5386-4049-99b0-fe0255c8d926	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Flour Blend (1kg)	Superb 1-to-1 substitute for baking gluten-free.	290	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-028	120	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
6f02c122-63d0-4b44-86cf-7cf13d118347	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Baked Quinoa Chips Sea Salt (100g)	Crispy, protein rich quinoa chips, light and crunchy.	110	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-029	180	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	99	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
f47821c7-72b6-4a55-af50-e984c76ce405	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Crispy Baked Beetroot Chips (80g)	Oil-free baked sweet beetroot crisps.	95	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-030	140	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	86	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
0fabf119-aab9-4418-b9b7-56d03a167efc	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Roasted Makhana Salt & Pepper (100g)	Crunchy foxnuts popped and roasted, seasoned with pepper.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-031	160	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
fd36fc18-a0f7-4394-b431-055326dc3581	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Premium Dried Mixed Berries (200g)	Blend of cranberries, blueberries, cherries, and raisins.	350	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-032	110	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	315	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
f8e4e394-d021-436f-a76f-6615d7cdc676	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Dried Goji Berries Organic (150g)	Sweet, chewy berries packed with vitamin A.	390	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-033	50	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
b17cb5d2-cb8f-4396-97d5-7d3a8baf91bb	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Toasted Coconut Chips (100g)	Thin coconut ribbons toasted with a pinch of sea salt.	120	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-034	150	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	108	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
bb4d7244-5c15-4fbe-b2c8-faaf71e47e70	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Raw Cacao Nibs (150g)	Crunchy, unsweetened crushed organic cacao beans.	290	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-035	70	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
b6348c7f-3085-4733-a3a2-f206fb07f4f5	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Apple Cider Vinegar ACV Gummies (60 Pcs)	Delicious vegan ACV gummies with B-vitamins.	690	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-036	45	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	621	\N	\N	{"unit": "Pc"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
2db4b767-f4b7-46bb-9728-5f0fd7a8eda4	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold Pressed Green Juice (250ml)	Spinach, cucumber, celery, green apple, and mint.	149	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-037	50	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	134	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
da34855b-38e8-48b9-8aed-e8dc5df9766d	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Cold Pressed Pomegranate (250ml)	100% pure cold pressed pomegranate, no sugar added.	180	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-038	40	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	162	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
f59d36d0-9bf2-4643-817a-eebf79272456	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Beetroot Ginger Wellness Shot (100ml)	Concentrated shot of beetroot, ginger, and lemon.	90	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-039	70	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	81	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
bfea9271-ff88-44de-81c8-8df9020ea2bd	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Pure Organic Aloe Vera Juice (1L)	Cold processed inner leaf aloe juice, digestive aid.	299	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-040	65	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	269	\N	\N	{"unit": "L"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
5a249b73-69ba-4562-897b-5c1dd8c56336	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Raw Kombucha Original (330ml)	Effervescent fermented black tea rich in probiotics.	160	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-041	60	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	144	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
e5b6122d-80b4-4989-98e2-974ea1c3ff03	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Ginger Lemon Probiotic Kombucha (330ml)	Fermented sparkling tea with zesty ginger and lemon.	170	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-042	55	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	153	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
f9e3298e-06fd-472a-ab1f-60cd7b07f88e	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Apple Cinnamon Kombucha (330ml)	Warm cider notes in a fizzy probiotic tea.	170	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-043	50	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	153	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
7a79219c-0327-48f2-98df-3e41ff503199	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Organic Coconut Water (250ml)	Hydrating, single-source sweet organic coconut water.	60	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-044	150	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	54	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
0680557f-db1c-4b80-8806-38dd73c1ddde	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Organic Maca Root Powder (100g)	Adaptogenic Peruvian maca root powder for energy.	390	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-045	40	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	351	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
2a5d301d-86d0-4795-945a-8bb1cd53d4d1	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Raw Organic Cacao Powder (200g)	Unsweetened, cold-processed rich cacao powder.	320	INR	["https://images.unsplash.com/photo-1515696955266-4f67e104f9fe?w=300"]	NBP-SUP-046	85	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	288	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
e6227e5c-7318-48d9-82d0-280e9d0a3b8b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Gluten-Free Rolled Oats (1kg)	Pure whole grain oats, certified gluten free.	280	INR	["https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300"]	NBP-GRN-047	120	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	252	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
807fa0bd-c442-4801-9d20-3478f890a282	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Baked Beetroot Crisps (80g)	Light, crunchy and naturally sweet beetroot chips.	95	INR	["https://images.unsplash.com/photo-1542838132-92c53300491e?w=300"]	NBP-SNC-048	130	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	86	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
38e62056-dbfd-4474-9dfb-601a9729747b	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Detox Charcoal Lemonade (250ml)	Activated charcoal, lemon, agave, and alkaline water.	149	INR	["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300"]	NBP-JUC-049	35	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	134	\N	\N	{"unit": "ml"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
e6906021-6bcd-4247-82fe-ce761d437567	0318b0ab-23bc-4ec5-993f-f50d24766a5e	Vegan Cream Cheese Plain (200g)	Cultured cashew nut based plain cream cheese.	290	INR	["https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=300"]	NBP-VEG-050	40	t	f	2026-05-18 09:53:26.46+05:30	2026-05-18 09:53:26.46+05:30	261	\N	\N	{"unit": "g"}	d2912933-a21d-475e-a004-04acc4f455ca	veg	f	15	[]	\N	\N
6744f13d-1690-43ae-b211-51315e615b96	f3170057-94d6-4a8c-9d45-1732e09f1b96	Organic Whole Milk 1L	\N	85	INR	["https://images.unsplash.com/photo-1550583724-b2692b85b150"]	MILK-ORG-1L-1779087051175	50	t	f	2026-05-18 12:20:51.175+05:30	2026-05-18 12:20:51.175+05:30	0	\N	\N	{"brand": "Amul Organics", "expiry": "4 days from packing", "weight": "1 Litre"}	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	veg	f	15	[]	\N	\N
c2aef503-eca3-40c6-aebc-872b9ad99ebb	f3170057-94d6-4a8c-9d45-1732e09f1b96	Gluten-Free Sourdough Bread	\N	120	INR	["https://images.unsplash.com/photo-1549931319-a545dcf3bc73"]	BREAD-GF-1779087051176	20	t	f	2026-05-18 12:20:51.176+05:30	2026-05-18 12:20:51.176+05:30	0	\N	\N	{"brand": "Artisan Oven", "expiry": "3 days from packing", "weight": "400 grams"}	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	veg	f	15	[]	\N	\N
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
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."SystemSettings" (id, key, value, description, "createdAt", "updatedAt") FROM stdin;
c79b9ee3-1e0f-44d9-8dbe-5f4c292c635c	OPENAI_API_KEY	sk_e9t1g5v5_FbbZFijvIdWYoj6SE6JUb82g	Global OpenAI API Key for Vendor Chatbots	2026-05-11 13:17:08.875+05:30	2026-05-11 13:17:08.875+05:30
cfcc040c-22e5-4416-8e0b-d5936466e57a	SARVAM_API_KEY	sk_e9t1g5v5_FbbZFijvIdWYoj6SE6JUb82g	Global Sarvam AI API Key for Vendor Chatbots	2026-05-11 13:56:13.163+05:30	2026-05-11 13:56:13.163+05:30
\.


--
-- Data for Name: UserContacts; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserContacts" (id, "userId", "contactPhoneNumber", "contactName", "createdAt", "updatedAt") FROM stdin;
5e51525b-6df7-4bba-93e5-a515243a4407	0893032b-3193-47b5-a046-c0f762670f46	+919999999999	Rahul Sharma	2026-05-14 14:07:56.621322+05:30	2026-05-14 14:07:56.621322+05:30
\.


--
-- Data for Name: UserDealUsages; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserDealUsages" (id, "userId", "integrationId", "dealId", "usageCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: UserDevices; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."UserDevices" (id, uuid, "userId", "fcmToken", "socketId", "isOnline", "lastOnlineAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."Users" (id, "profilePictureUrl", uuid, password, "userName", "firstName", "lastName", email, "phoneNumber", cc, role, "lastLoginAt", "userVerified", otp, "otpExpiry", "fcmToken", location, city, state, "pinCode", addresses, "cdpDetails", "createdAt", "updatedAt", "mongoId", "portfolioAccess") FROM stdin;
964c8fa7-d191-4ebc-adc8-9790b2b0197f	\N	c4f06a30-6059-48fc-8e0a-f5ae267e6680	\N	\N	\N	\N	\N	9844982389	+91	SuperAdmin	1778831568225	t	548589	1778930149099	\N	\N	\N	\N	2123	[]	[]	2026-04-24 14:17:30.241+05:30	2026-05-16 15:50:10.22+05:30	69eb2e22ba23753ee507028e	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
efb318e9-cdec-423c-bb6f-e8213c38cb17	\N	9b7bae90-c449-4467-a19c-c9a570012d0d	\N	\N	\N	\N	\N	1234512345	+91	merchant_admin	1778927181744	t	000000	1778821636029	\N	\N	\N	\N	2123	[]	[]	2026-05-15 09:34:53.726253+05:30	2026-05-16 15:56:21.745+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
465f014e-e8a9-4ff4-ab78-8b456df5a39f	\N	a742899f-333d-4333-86da-f6f4f6201dd3	\N	\N	\N	\N	\N	2323232323	+91	User	\N	f	839760	1778484281528	\N	\N	\N	\N	\N	[]	[]	2026-05-11 11:54:41.53+05:30	2026-05-11 11:54:41.53+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
b9443817-5090-4d74-8463-c6e800e87018	\N	721a85b6-e0fa-43f8-8921-e4ed54036f40	\N	\N	\N	\N	\N	4343434343	+91	User	\N	f	411295	1778485902094	\N	\N	\N	\N	\N	[]	[]	2026-05-11 11:56:22.421+05:30	2026-05-11 12:21:42.094+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
8781fcc7-3f43-4fae-91e6-5aed25f067b6	\N	cf8771bd-cdfa-4ebc-93b7-f1ac6eb2f9de	\N	\N	\N	\N	\N	8989898898	+91	User	1778610075434	t	000000	1778613672964	\N	\N	\N	\N	\N	[]	[]	2026-05-12 23:51:12.965+05:30	2026-05-12 23:51:15.434+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
4dd14875-a33b-4a43-be2f-f09af11881a0	\N	998d1137-0770-4736-afb5-a874b80e1978	\N	\N	\N	\N	\N	9999999999	+91	SuperAdmin	1779029960824	t	\N	\N	\N	\N	\N	\N	2123	[]	[]	2026-05-15 10:50:28.497+05:30	2026-05-17 20:29:20.825+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
0893032b-3193-47b5-a046-c0f762670f46	\N	0a57f3b1-5e4d-461f-b4cd-8ad729d3aa95	\N	\N	\N	\N	\N	9898989898	+91	User	1779078008034	t	000000	1778826068975	\N	\N	\N	\N	2123	[]	[]	2026-05-11 12:22:10.111+05:30	2026-05-18 09:50:08.036+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
e4791d20-e5a6-4f07-87c8-8989898989ab	\N	uuid-8989898989	\N	\N	Test	Shopper	shopper@test.com	8989898989	+91	User	1778477827703	t	000000	1778825097695	\N	\N	\N	\N	\N	[]	[]	2026-05-10 15:41:39.547891+05:30	2026-05-15 10:34:57.695+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
ee5a707f-5382-4e09-8451-9e509740cd62	\N	40373926-aab8-43a7-9117-8fad42756983	\N	\N	Rahul	Sharma	\N	+919999999999	+91	SuperAdmin	\N	t	\N	\N	\N	\N	\N	\N	\N	[]	[]	2026-05-09 15:34:03.95039+05:30	2026-05-16 15:05:53.775+05:30	\N	{"merchants": [], "verticals": [], "accessType": "GLOBAL"}
\.


--
-- Data for Name: VendorAIConfigs; Type: TABLE DATA; Schema: public; Owner: tubulu_admin
--

COPY public."VendorAIConfigs" (id, "integrationId", "masterPrompt", "faqContext", "isActive", "catalogScoped", "modelName", temperature, "createdAt", "updatedAt") FROM stdin;
72cca7df-106f-44fc-ae59-cef0e262dfbf	908fa830-7d67-4555-8d3b-a72b20636d44	You are a helpful assistant for this store. You only answer questions related to the items in our catalogue.	[{"answer": "", "question": ""}]	t	t	gpt-3.5-turbo	0.7	2026-05-11 13:18:16.754+05:30	2026-05-11 13:39:28.312+05:30
4e20967d-3320-46c1-80b8-86e6b260851f	e7bb8f23-5a97-4d2d-b629-1ab6ed95251a	\N	[]	t	t	gpt-3.5-turbo	0.7	2026-05-18 12:20:51.173+05:30	2026-05-18 12:20:51.173+05:30
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
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key15; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key15" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key16; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key16" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key17; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key17" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key18; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key18" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key19; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key19" UNIQUE ("categoryKey");


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
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key21; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key21" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key22; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key22" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key23; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key23" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key24; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key24" UNIQUE ("categoryKey");


--
-- Name: AICategoryPlaybooks AICategoryPlaybooks_categoryKey_key25; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."AICategoryPlaybooks"
    ADD CONSTRAINT "AICategoryPlaybooks_categoryKey_key25" UNIQUE ("categoryKey");


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
-- Name: Advertisements Advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Advertisements"
    ADD CONSTRAINT "Advertisements_pkey" PRIMARY KEY (id);


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
-- Name: IntegrationDocuments IntegrationDocuments_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."IntegrationDocuments"
    ADD CONSTRAINT "IntegrationDocuments_pkey" PRIMARY KEY (id);


--
-- Name: Integrations Integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_pkey" PRIMARY KEY (id);


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
-- Name: SystemSettings SystemSettings_key_key11; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key11" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key12; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key12" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key13; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key13" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key14; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key14" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key15; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key15" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key16; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key16" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key17; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key17" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key18; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key18" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key19; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key19" UNIQUE (key);


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
-- Name: SystemSettings SystemSettings_key_key21; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key21" UNIQUE (key);


--
-- Name: SystemSettings SystemSettings_key_key22; Type: CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_key_key22" UNIQUE (key);


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
-- Name: Integrations Integrations_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Integrations"
    ADD CONSTRAINT "Integrations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
    ADD CONSTRAINT "Reviews_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id);


--
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: Settlements Settlements_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."Settlements"
    ADD CONSTRAINT "Settlements_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserContacts UserContacts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."UserContacts"
    ADD CONSTRAINT "UserContacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


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
-- Name: VendorAIConfigs VendorAIConfigs_integrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tubulu_admin
--

ALTER TABLE ONLY public."VendorAIConfigs"
    ADD CONSTRAINT "VendorAIConfigs_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES public."Integrations"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict LmkWmmd3IPraFZuVh2eFLVchfKunUngMWYuQMEy944EHf5PgfCtpzhfoGJHcJjC

