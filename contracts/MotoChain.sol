// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MotoChain
 * @dev Quản lý bảo dưỡng xe máy trên blockchain
 * - Đăng ký xe máy
 * - Ghi nhận lịch sử bảo dưỡng
 * - Lưu trữ hóa đơn trên IPFS
 * - Tra cứu bằng QR code
 */
contract MotoChain {
    address public owner;

    uint256 public motorcycleCount;
    uint256 public maintenanceCount;
    uint256 public garageCount;

    struct Motorcycle {
        uint256 id;
        string plateNumber;
        string brand;
        string model;
        uint256 year;
        address ownerAddress;
        uint256 registeredAt;
        bool isActive;
    }

    struct MaintenanceRecord {
        uint256 id;
        uint256 motorcycleId;
        address garage;
        string serviceType;
        string description;
        uint256 mileage;
        string ipfsHash;
        uint256 cost;
        uint256 timestamp;
    }

    struct Garage {
        uint256 id;
        string name;
        string location;
        address walletAddress;
        bool isApproved;
        uint256 registeredAt;
    }

    // Mappings
    mapping(uint256 => Motorcycle) public motorcycles;
    mapping(uint256 => MaintenanceRecord) public maintenanceRecords;
    mapping(uint256 => Garage) public garages;

    // Motorcycle ID => list of maintenance record IDs
    mapping(uint256 => uint256[]) public motorcycleMaintenanceIds;

    // Plate number => motorcycle ID (for lookup)
    mapping(string => uint256) public plateToMotorcycleId;

    // Address => garage ID
    mapping(address => uint256) public addressToGarageId;

    // Address => list of motorcycle IDs owned
    mapping(address => uint256[]) public ownerMotorcycles;

    // Events
    event MotorcycleRegistered(
        uint256 indexed id,
        string plateNumber,
        string brand,
        address indexed ownerAddress
    );

    event MaintenanceAdded(
        uint256 indexed id,
        uint256 indexed motorcycleId,
        address indexed garage,
        string serviceType,
        uint256 cost
    );

    event GarageRegistered(
        uint256 indexed id,
        string name,
        address indexed walletAddress
    );

    event GarageApproved(uint256 indexed id, address indexed walletAddress);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this");
        _;
    }

    modifier onlyApprovedGarage() {
        uint256 garageId = addressToGarageId[msg.sender];
        require(garageId > 0, "Not a registered garage");
        require(garages[garageId].isApproved, "Garage not approved yet");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ============ MOTORCYCLE FUNCTIONS ============

    function registerMotorcycle(
        string memory _plateNumber,
        string memory _brand,
        string memory _model,
        uint256 _year
    ) public returns (uint256) {
        require(bytes(_plateNumber).length > 0, "Plate number required");
        require(bytes(_brand).length > 0, "Brand required");
        require(plateToMotorcycleId[_plateNumber] == 0, "Plate already registered");

        motorcycleCount++;
        uint256 newId = motorcycleCount;

        motorcycles[newId] = Motorcycle({
            id: newId,
            plateNumber: _plateNumber,
            brand: _brand,
            model: _model,
            year: _year,
            ownerAddress: msg.sender,
            registeredAt: block.timestamp,
            isActive: true
        });

        plateToMotorcycleId[_plateNumber] = newId;
        ownerMotorcycles[msg.sender].push(newId);

        emit MotorcycleRegistered(newId, _plateNumber, _brand, msg.sender);
        return newId;
    }

    function getMotorcycle(uint256 _id)
        public
        view
        returns (
            uint256 id,
            string memory plateNumber,
            string memory brand,
            string memory model,
            uint256 year,
            address ownerAddress,
            uint256 registeredAt,
            bool isActive
        )
    {
        require(_id > 0 && _id <= motorcycleCount, "Motorcycle not found");
        Motorcycle memory m = motorcycles[_id];
        return (
            m.id,
            m.plateNumber,
            m.brand,
            m.model,
            m.year,
            m.ownerAddress,
            m.registeredAt,
            m.isActive
        );
    }

    function getMotorcycleByPlate(string memory _plateNumber)
        public
        view
        returns (uint256)
    {
        uint256 motoId = plateToMotorcycleId[_plateNumber];
        require(motoId > 0, "Motorcycle not found with this plate");
        return motoId;
    }

    function getOwnerMotorcycles(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        return ownerMotorcycles[_owner];
    }

    // ============ GARAGE FUNCTIONS ============

    function registerGarage(
        string memory _name,
        string memory _location
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Garage name required");
        require(addressToGarageId[msg.sender] == 0, "Already registered as garage");

        garageCount++;
        uint256 newId = garageCount;

        garages[newId] = Garage({
            id: newId,
            name: _name,
            location: _location,
            walletAddress: msg.sender,
            isApproved: false,
            registeredAt: block.timestamp
        });

        addressToGarageId[msg.sender] = newId;

        emit GarageRegistered(newId, _name, msg.sender);
        return newId;
    }

    function approveGarage(uint256 _garageId) public onlyOwner {
        require(_garageId > 0 && _garageId <= garageCount, "Garage not found");
        require(!garages[_garageId].isApproved, "Already approved");

        garages[_garageId].isApproved = true;

        emit GarageApproved(_garageId, garages[_garageId].walletAddress);
    }

    function getGarage(uint256 _id)
        public
        view
        returns (
            uint256 id,
            string memory name,
            string memory location,
            address walletAddress,
            bool isApproved,
            uint256 registeredAt
        )
    {
        require(_id > 0 && _id <= garageCount, "Garage not found");
        Garage memory g = garages[_id];
        return (g.id, g.name, g.location, g.walletAddress, g.isApproved, g.registeredAt);
    }

    // ============ MAINTENANCE FUNCTIONS ============

    function addMaintenanceRecord(
        uint256 _motorcycleId,
        string memory _serviceType,
        string memory _description,
        uint256 _mileage,
        string memory _ipfsHash,
        uint256 _cost
    ) public onlyApprovedGarage returns (uint256) {
        require(
            _motorcycleId > 0 && _motorcycleId <= motorcycleCount,
            "Motorcycle not found"
        );
        require(motorcycles[_motorcycleId].isActive, "Motorcycle not active");
        require(bytes(_serviceType).length > 0, "Service type required");

        maintenanceCount++;
        uint256 newId = maintenanceCount;

        maintenanceRecords[newId] = MaintenanceRecord({
            id: newId,
            motorcycleId: _motorcycleId,
            garage: msg.sender,
            serviceType: _serviceType,
            description: _description,
            mileage: _mileage,
            ipfsHash: _ipfsHash,
            cost: _cost,
            timestamp: block.timestamp
        });

        motorcycleMaintenanceIds[_motorcycleId].push(newId);

        emit MaintenanceAdded(newId, _motorcycleId, msg.sender, _serviceType, _cost);
        return newId;
    }

    function getMaintenanceRecord(uint256 _id)
        public
        view
        returns (
            uint256 id,
            uint256 motorcycleId,
            address garage,
            string memory serviceType,
            string memory description,
            uint256 mileage,
            string memory ipfsHash,
            uint256 cost,
            uint256 timestamp
        )
    {
        require(_id > 0 && _id <= maintenanceCount, "Record not found");
        MaintenanceRecord memory r = maintenanceRecords[_id];
        return (
            r.id,
            r.motorcycleId,
            r.garage,
            r.serviceType,
            r.description,
            r.mileage,
            r.ipfsHash,
            r.cost,
            r.timestamp
        );
    }

    function getMaintenanceHistory(uint256 _motorcycleId)
        public
        view
        returns (uint256[] memory)
    {
        require(
            _motorcycleId > 0 && _motorcycleId <= motorcycleCount,
            "Motorcycle not found"
        );
        return motorcycleMaintenanceIds[_motorcycleId];
    }

    function getMaintenanceCount(uint256 _motorcycleId)
        public
        view
        returns (uint256)
    {
        return motorcycleMaintenanceIds[_motorcycleId].length;
    }

    // ============ UTILITY FUNCTIONS ============

    function getAllMotorcycleCount() public view returns (uint256) {
        return motorcycleCount;
    }

    function getAllGarageCount() public view returns (uint256) {
        return garageCount;
    }

    function getAllMaintenanceCount() public view returns (uint256) {
        return maintenanceCount;
    }
}
