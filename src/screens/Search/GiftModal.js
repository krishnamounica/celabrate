import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const GiftModal = ({ visible, onClose, product }) => {
  const [formStep, setFormStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    occasion: "",
    date: "",
    flatNo: "",
    apartment: "",
    landmark: "",
    district: "",
    state: "",
    pincode: "",
  });

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        relation: formData.relation,
        occasion: formData.occasion,
        date: formData.date,
        flatNumber: formData.flatNo,
        building: formData.apartment,
        landmark: formData.landmark,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        status: "pending",
        feedback: [],
        payment: false,
        sharable: false,
        userName: "suresh", 
        sharablelink: "",
        totalAmount: product.price,
        remainingAmount: product.price,
        noOfPayments: 0,
      };

      const response = await axios.post(
        "https://easyshop-7095.onrender.com/api/v1/giftrequests",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzk3MWQ0MmY2NmFjZDJkYjk5OGU1MTYiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NDU4MDgzMDMsImV4cCI6MTc0NTg5NDcwM30.kMhdnSdQ2-IFaldXj0n3WJobSP6uHmfWuRhheQqYDA0",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Gift request submitted successfully!");
        onClose(); // Close modal
        setFormStep(1); // Reset form
      } else {
        alert("Failed to submit gift request.");
      }
    } catch (error) {
      console.error("Error submitting gift request:", error);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Step {formStep}</Text>

          {/* Form steps */}
          {formStep === 1 && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Enter recipient's name"
              />
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            </>
          )}

          {formStep === 2 && (
            <>
              <Text style={styles.label}>Relation</Text>
              <RNPickerSelect
                onValueChange={(value) =>
                  handleInputChange("relation", value)
                }
                value={formData.relation}
                items={[
                  { label: "Friend", value: "Friend" },
                  { label: "Brother", value: "Brother" },
                  { label: "Sister", value: "Sister" },
                  { label: "Mother", value: "Mother" },
                  { label: "Father", value: "Father" },
                ]}
                placeholder={{ label: "Select a relation", value: null }}
              />
              <Text style={styles.label}>Occasion</Text>
              <RNPickerSelect
                onValueChange={(value) =>
                  handleInputChange("occasion", value)
                }
                value={formData.occasion}
                items={[
                  { label: "Birthday", value: "Birthday" },
                  { label: "Anniversary", value: "Anniversary" },
                  { label: "Wedding", value: "Wedding" },
                  { label: "Graduation", value: "Graduation" },
                  { label: "Festival", value: "Festival" },
                ]}
                placeholder={{ label: "Select an occasion", value: null }}
              />
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formData.date || "Select date"}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const year = selectedDate.getFullYear();
                      const month = String(
                        selectedDate.getMonth() + 1
                      ).padStart(2, "0");
                      const day = String(selectedDate.getDate()).padStart(
                        2,
                        "0"
                      );
                      const formatted = `${year}-${month}-${day}`;
                      handleInputChange("date", formatted);
                    }
                  }}
                />
              )}
            </>
          )}

          {formStep === 3 && (
            <>
              <Text style={styles.label}>Flat No.</Text>
              <TextInput
                style={styles.input}
                value={formData.flatNo}
                onChangeText={(text) => handleInputChange("flatNo", text)}
              />
              <Text style={styles.label}>Apartment</Text>
              <TextInput
                style={styles.input}
                value={formData.apartment}
                onChangeText={(text) => handleInputChange("apartment", text)}
              />
              <Text style={styles.label}>Landmark</Text>
              <TextInput
                style={styles.input}
                value={formData.landmark}
                onChangeText={(text) => handleInputChange("landmark", text)}
              />
            </>
          )}

          {formStep === 4 && (
            <>
              <Text style={styles.label}>District</Text>
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(text) => handleInputChange("district", text)}
              />
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => handleInputChange("state", text)}
              />
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={formData.pincode}
                onChangeText={(text) => handleInputChange("pincode", text)}
                keyboardType="numeric"
              />
            </>
          )}

          {/* Navigation Buttons */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {formStep > 1 && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#aaa" }]}
                onPress={() => setFormStep(formStep - 1)}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            {formStep < 4 ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setFormStep(formStep + 1)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GiftModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginTop: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
