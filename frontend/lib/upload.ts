import api from "./api";

/**
 * Shape of the listing form data collected by the ListingWizard.
 */
export interface ListingFormData {
    images: File[];
    brand: string;
    model: string;
    price: string;
    condition: "new" | "used";
    batteryHealth: string;
    ptaApproved: boolean;
    defects: string;
    warrantyPeriod: string;
    processor: string;
    storage: string;
    ram: string;
    color: string;
    physicalCondition: number;
    accessories: string[];
}

/**
 * Build a multipart FormData payload and POST it to the backend.
 *
 * Images are appended under the key "images" (one entry per file).
 * All scalar fields are appended as-is; arrays are JSON-stringified.
 */
export async function submitListing(data: ListingFormData) {
    const fd = new FormData();

    // Append each selected image file
    data.images.forEach((file) => {
        fd.append("images", file);
    });

    // Append scalar fields
    fd.append("brand", data.brand);
    fd.append("model", data.model);
    fd.append("price", data.price);
    fd.append("condition", data.condition);
    fd.append("storage", data.storage);
    fd.append("ram", data.ram);
    fd.append("color", data.color);
    fd.append("physical_condition", String(data.physicalCondition));
    fd.append("pta_approved", String(data.ptaApproved));

    // Condition-specific fields
    if (data.condition === "used") {
        fd.append("battery_health", data.batteryHealth);
        fd.append("defects", data.defects);
    } else {
        fd.append("warranty_period", data.warrantyPeriod);
        fd.append("processor", data.processor);
    }

    // Accessories as JSON array
    fd.append("accessories", JSON.stringify(data.accessories));

    const response = await api.post("/listings/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
}
