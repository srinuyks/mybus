package com.mybus.controller;

import com.google.common.base.Preconditions;
import com.mybus.controller.util.ControllerUtils;
import com.mybus.dao.CityDAO;
import com.mybus.model.BoardingPoint;
import com.mybus.model.City;
import com.mybus.service.CityManager;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
@RequestMapping(value = "/api/v1/")
@Api(value="CityController", description="City and Boarding points management")
public class CityController extends MyBusBaseController{
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private CityDAO cityDAO;

    @Autowired
    private CityManager cityManager;


    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "cities", method = RequestMethod.GET, produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value = "Get all the cities available", response = City.class, responseContainer = "List")
    public Iterable<City> getCities(HttpServletRequest request) {
        return cityDAO.findAll();
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "activeCityNames", method = RequestMethod.GET, produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value = "Get names of the active cities as key value pair", response = Map.class, responseContainer = "Map")
    public Map<String, String> getActiveCityNames(HttpServletRequest request) {
        return cityManager.getCityNames(false);
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "allCityNames", method = RequestMethod.GET, produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value = "Get names of the active cities as key value pair", response = Map.class, responseContainer = "Map")
    public Map<String, String> getAllCityNames(HttpServletRequest request) {
        return cityManager.getCityNames(true);
    }


    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city", method = RequestMethod.POST, produces = ControllerUtils.JSON_UTF8,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    @ApiOperation(value = "Create a city")
    public ResponseEntity createCity(HttpServletRequest request,
                           @ApiParam(value = "JSON for City to be created") @RequestBody final City city){
        logger.debug("post city called");
        return new ResponseEntity<>(cityManager.saveCity(city), HttpStatus.OK);
    }

    @RequestMapping(value = "city/{id}", method = RequestMethod.GET, produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value ="Get the City JSON", response = City.class)
    public City getCity(HttpServletRequest request,
                        @ApiParam(value = "Id of the City to be found") @PathVariable final String id) {
        logger.debug("get city called");
        return cityDAO.findOne(id);
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{id}", method = RequestMethod.PUT)
    @ResponseBody
    @ApiOperation(value ="Update city", response = City.class)
    public ResponseEntity updateCity(HttpServletRequest request,
                        @ApiParam(value = "Id of the City to be found") @PathVariable final String id,
                        @ApiParam(value = "City JSON") @RequestBody final City city) {
        logger.debug("get city called");
        return new ResponseEntity<>(cityManager.updateCity(city), HttpStatus.OK);
    }
    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    @ApiOperation(value ="Delete a city")
    public JSONObject deleteCity(HttpServletRequest request,
                                 @ApiParam(value = "Id of the city to be deleted") @PathVariable final String id) {
        logger.debug("get city called");
        JSONObject response = new JSONObject();
        response.put("deleted", cityManager.deleteCity(id));
        return response;
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{cityId}/boardingpoint", method = RequestMethod.POST,
            produces = ControllerUtils.JSON_UTF8,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    @ApiOperation(value ="Create a new city boarding point", response = City.class)
    public City createCityBoardingpoint(HttpServletRequest request,
                                        @ApiParam(value = "Id of the city to which boardingpoint to be added") @PathVariable final String cityId,
                                        @ApiParam(value = "JSON for boardingpoint") @RequestBody final BoardingPoint bp) {
        logger.debug("create boardingpoint called");
        return cityManager.addBoardingPointToCity(cityId, bp);
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{cityId}/boardingpoint/{id}", method = RequestMethod.GET,
            produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value ="Get JSON for a city boardingpoint", response = BoardingPoint.class)
    public BoardingPoint getgCityBoardingpoint(HttpServletRequest request,
                                                @ApiParam(value = "cityId") @PathVariable final String cityId,
                                                @ApiParam(value = "BoardingpointId") @PathVariable final String id) {
        logger.debug("create boardingpoint called");
        BoardingPoint bp = cityManager.getBoardingPoint(cityId, id);
        Preconditions.checkNotNull(bp, "No boardingpoint found");
        return bp;
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{cityId}/boardingpoint", method = RequestMethod.PUT,
            produces = ControllerUtils.JSON_UTF8,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    @ApiOperation(value ="Update a city boarding point", response = City.class)
    public City updateCityBoardingpoint(HttpServletRequest request,
                @ApiParam(value = "Id of the city to which contains boardingpoint ")@PathVariable final String cityId,
                @ApiParam(value = "JSON for boardingpoint") @RequestBody final BoardingPoint bp) {
        logger.debug("create boardingpoint called");
        return cityManager.updateBoardingPoint(cityId, bp);
    }

    @ResponseStatus(value = HttpStatus.OK)
    @RequestMapping(value = "city/{cityId}/boardingpoint/{id}", method = RequestMethod.DELETE,
            produces = ControllerUtils.JSON_UTF8)
    @ResponseBody
    @ApiOperation(value ="Delete a city boarding point", response = City.class)
    public City deleteCityBoardingpoint(HttpServletRequest request,
                                        @ApiParam(value = "City Id")  @PathVariable final String cityId,
                                        @ApiParam(value ="Boardingpoint Id")@PathVariable final String id) {
        logger.debug("create boardingpoint called");
        return cityManager.deleteBoardingPoint(cityId, id);
    }

}
